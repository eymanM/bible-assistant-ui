import { useState } from 'react';

import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/language-context';

interface BibleSearchSettings {
  oldTestament: boolean;
  newTestament: boolean;
  commentary: boolean;
  insights: boolean;
}

interface SearchResponse {
  bible_results: string[];
  commentary_results: string[];
  llm_response: string;
}

export const useBibleSearch = () => {
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState<BibleSearchSettings>({
    oldTestament: true,
    newTestament: true,
    commentary: false,
    insights: true
  });
  const { language, t } = useLanguage();
  const [results, setResults] = useState<{
    bible: string[];
    commentary: string[];
    llmResponse: string;
  }>({
    bible: [],
    commentary: [],
    llmResponse: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTranslatedError = (msg: string) => {
    if (!msg) return t.apiErrors.internalError;
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes('internal server error')) return t.apiErrors.internalError;
    if (lowerMsg.includes('insufficient credits')) return t.apiErrors.insufficientCredits;
    if (lowerMsg.includes('user not found')) return t.apiErrors.userNotFound;
    if (lowerMsg.includes('user id is required')) return t.apiErrors.userIdRequired;
    
    return msg;
  };

  // Helper wrapper for setError to always translate
  const setTranslatedError = (msg: string | null) => {
    if (msg === null) {
      setError(null);
    } else {
      setError(getTranslatedError(msg));
    }
  };
  const { user } = useAuth();
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);

  const search = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setTranslatedError(null);
    setCurrentHistoryId(null);
    setResults({ bible: [], commentary: [], llmResponse: '' });

    try {
      // Check credits BEFORE starting search if AI insights are enabled
      if (settings.insights) {
        if (!user || !user.userId) {
          throw new Error('You must be logged in to use AI Insights');
        }

        // Check if user has sufficient credits
        const checkRes = await fetch('/api/credits/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId })
        });

        if (!checkRes.ok) {
          const errorData = await checkRes.json();
          throw new Error(errorData.error || 'Insufficient credits');
        }
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          settings: {
            ...settings,
            language
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let hasResults = false;
      let tempResults = { bible: [], commentary: [], llmResponse: '' };
      let isFirstData = true;
      let hasError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          
          const lines = part.split('\n');
          let event = '';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              event = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              data = line.substring(6).trim();
            }
          }

          if (event === 'results' && data) {
            try {
              const parsed = JSON.parse(data);
              tempResults = {
                ...tempResults,
                bible: parsed.bible_results || [],
                commentary: parsed.commentary_results || []
              };
              
              
              // Check if we have any results
              if (parsed.bible_results?.length > 0 || parsed.commentary_results?.length > 0) {
                hasResults = true;
              }
              
              if (parsed.history_id) {
                setCurrentHistoryId(parsed.history_id);
              }
            } catch (e) {
              console.error('Error parsing results:', e);
            }

          } else if (event === 'token' && data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                // Filter out markdown asterisks as we don't render markdown
                const cleanToken = parsed.token.replace(/\*\*/g, '');
                
                if (cleanToken) {
                  tempResults.llmResponse += cleanToken;
                  hasResults = true;
                  setResults(prev => ({
                    ...prev,
                    llmResponse: prev.llmResponse + cleanToken
                  }));
                }
              }
            } catch (e) {
              console.error('Error parsing token:', e);
            }
            
            if (isFirstData) {
              setLoading(false);
              isFirstData = false;
            }
          } else if (event === 'error' && data) {
            hasError = true;
            try {
               const parsed = JSON.parse(data);
               let errorMsg = parsed.error || 'An error occurred';
               
               // Try to clean up technical errors
               if (typeof errorMsg === 'string') {
                 // Handle specialized OpenAI/Backend errors that might be stringified JSON
                 if (errorMsg.includes("'message':")) {
                    try {
                      // Attempt to extract the message part roughly
                      const match = errorMsg.match(/'message':\s*"([^"]+)"/);
                      if (match && match[1]) {
                        errorMsg = `AI Service Error: ${match[1]}`;
                      } 
                      // Sometimes it uses single quotes
                      else {
                         const match2 = errorMsg.match(/'message':\s*'([^']+)'/);
                         if (match2 && match2[1]) {
                           errorMsg = `AI Service Error: ${match2[1]}`;
                         }
                      }
                    } catch (ignore) {}
                 }
               }
               
               setTranslatedError(errorMsg);
            } catch (e) {
               console.error('Error parsing error event:', e);
               setTranslatedError('An error occurred');
            }
            setLoading(false);
          }
        }
      }



      // Save to history if we have results and a user
      // Requirement: if AI insights is enabled but no response received, do not save
      const shouldSave = hasResults && user?.userId && (!settings.insights || (settings.insights && tempResults.llmResponse));

      if (shouldSave) {
        try {
          const historyRes = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.userId,
              query: searchQuery,
              response: tempResults.llmResponse,
              bible_results: tempResults.bible,
              commentary_results: tempResults.commentary,
              language: language,
              settings: settings
            })
          });
          
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            if (historyData.entry && historyData.entry.id) {
               setCurrentHistoryId(historyData.entry.id);
            }
          }

          // Trigger history refresh
          setHistoryRefreshTrigger(prev => prev + 1);
        } catch (e) {
          console.error('Failed to save history:', e);
        }
      }

      // Only deduct credits if AI insights are enabled AND we got results AND no error occurred
      if (settings.insights && hasResults && !hasError && user?.userId) {
        try {
          const deductRes = await fetch('/api/credits/deduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.userId })
          });

          if (!deductRes.ok) {
            const errorData = await deductRes.json();
            // Silently log the error - don't show to user, don't block results
            console.warn('Credit deduction failed:', errorData.error);
          }
        } catch (e) {
          // Silently log any errors - don't interrupt user experience
          console.warn('Credit deduction error:', e);
        }
      }
    } catch (err) {
      setTranslatedError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (
    historyItem: { 
      query: string; 
      response?: string; 
      bible_results?: string[]; 
      commentary_results?: string[];
      language?: string;
      settings?: any;
    },
    setLanguage?: (lang: 'en' | 'pl') => void
  ) => {
    setQuery(historyItem.query);
    setResults({
      bible: historyItem.bible_results || [],
      commentary: historyItem.commentary_results || [],
      llmResponse: historyItem.response || ''
    });
    
    // Restore settings if available
    if (historyItem.settings) {
      setSettings(historyItem.settings);
    }
    
    // Restore language if available and setLanguage is provided
    if (historyItem.language && setLanguage) {
      setLanguage(historyItem.language as 'en' | 'pl');
    }
    
    
    setTranslatedError(null);
    setLoading(false);
    // @ts-ignore
    if (historyItem.id) {
      // @ts-ignore
      setCurrentHistoryId(historyItem.id);
    }
  };


  const vote = async (voteType: 'up' | 'down') => {
    if (!currentHistoryId) return;
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyId: currentHistoryId, voteType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Can optionally update local state if we want to show counts
    } catch (e) {
      console.error('Error voting:', e);
    }
  };

  return {
    query,
    setQuery,
    settings,
    setSettings,
    results,
    loading,
    error,
    search,
    loadFromHistory,
    historyRefreshTrigger,
    vote,
    currentHistoryId
  };
};
