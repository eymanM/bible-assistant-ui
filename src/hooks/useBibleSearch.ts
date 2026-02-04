import { useState, useCallback, useRef } from 'react';

import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/language-context';
import { getAuthHeaders, getOptionalAuthHeaders } from '../lib/auth-helpers';

interface BibleSearchSettings {
  oldTestament: boolean;
  newTestament: boolean;
  commentary: boolean;
  insights: boolean;
  media: boolean;
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
    insights: true,
    media: false
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
  const loadingRef = useRef(false); // Ref to track loading state synchronously
  const [error, setError] = useState<string | null>(null);

  const getTranslatedError = useCallback((msg: string) => {
    if (!msg) return t.apiErrors.internalError;
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes('internal server error')) return t.apiErrors.internalError;
    if (lowerMsg.includes('insufficient credits')) return t.apiErrors.insufficientCredits;
    if (lowerMsg.includes('user not found')) return t.apiErrors.userNotFound;
    if (lowerMsg.includes('user id is required')) return t.apiErrors.userIdRequired;
    if (lowerMsg.includes('network response was not ok')) return t.apiErrors.networkError;
    if (lowerMsg.includes('unauthorized') || lowerMsg.includes('nieautoryzowany')) return t.apiErrors.unauthorized;
    if (lowerMsg.includes('failed to vote')) return t.apiErrors.failedToVote;
    if (lowerMsg.includes("'nonetype' object has no attribute 'stream'")) return t.apiErrors.internalError;
    if (lowerMsg.includes('daily request limit exceeded') || lowerMsg.includes('server overloaded')) return t.apiErrors.rateLimitExceeded;
    
    return msg;
  }, [t]);

  const setTranslatedError = useCallback((msg: string | null) => {
    if (msg === null) {
      setError(null);
    } else {
      setError(getTranslatedError(msg));
    }
  }, [getTranslatedError]);

  const { user } = useAuth();
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (loadingRef.current) return;
    setQuery(searchQuery);
    setLoading(true);
    loadingRef.current = true;
    
    setTranslatedError(null);
    setCurrentHistoryId(null);
    setCurrentSearchId(null);
    setVoteStatus(null);
    setResults({ bible: [], commentary: [], llmResponse: '' });

    try {
      // Check credits BEFORE starting search if AI insights are enabled
      if (settings.insights) {
        if (!user || !user.userId) {
          throw new Error('You must be logged in to use AI Insights');
        }

        // Check if user has sufficient credits
        const headers = await getAuthHeaders();
        const checkRes = await fetch('/api/credits/check', {
          method: 'POST',
          headers
        });

        if (!checkRes.ok) {
          const errorData = await checkRes.json();
          throw new Error(errorData.error || 'Insufficient credits');
        }
      }

      const headers = await getOptionalAuthHeaders();
      const response = await fetch('/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          query: searchQuery,
          settings: {
            ...settings,
            language
          }
        }),
      });


      if (!response.ok) {
        if (response.status === 429) {
             throw new Error('Daily request limit exceeded');
        }
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
              
              setResults(prev => ({
                ...prev,
                bible: tempResults.bible,
                commentary: tempResults.commentary
              }));
              
              
              if (parsed.bible_results?.length > 0 || parsed.commentary_results?.length > 0) {
                hasResults = true;
              }
              
              if (parsed.history_id) {
                setCurrentHistoryId(parsed.history_id);
              }
              if (parsed.search_id) {
                setCurrentSearchId(parsed.search_id);
              }
            } catch (e) {
              console.error('Error parsing results:', e);
            }

          } else if (event === 'token' && data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                // Filter out markdown asterisks as we don't render markdown
                let tokenStr = '';
                if (typeof parsed.token === 'string') {
                  tokenStr = parsed.token;
                } else if (typeof parsed.token === 'object' && parsed.token?.text) {
                  tokenStr = parsed.token.text;
                }
                
                const cleanToken = tokenStr.replace(/\*\*/g, '');
                
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
      // Prepare parallel tasks for history saving and credit deduction
      const historyTask = async () => {
        const shouldSave = hasResults && user?.userId && (!settings.insights || (settings.insights && tempResults.llmResponse));
        
        if (shouldSave) {
          try {
            const headers = await getAuthHeaders();
            const historyRes = await fetch('/api/history', {
              method: 'POST',
              headers,
              body: JSON.stringify({
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
      };

      const creditsTask = async () => {
        if (settings.insights && hasResults && !hasError && user?.userId) {
          try {
            const headers = await getAuthHeaders();
            const deductRes = await fetch('/api/credits/deduct', {
              method: 'POST',
              headers,
              body: JSON.stringify({ amount: 1 })
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
      };

      // Execute both side effects in parallel
      await Promise.allSettled([historyTask(), creditsTask()]);
    } catch (err) {
      setTranslatedError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [settings, user, language, setTranslatedError]);

  const loadFromHistory = useCallback((
    historyItem: { 
      query: string; 
      response?: string; 
      bible_results?: string[]; 
      commentary_results?: string[];
      language?: string;
      settings?: any;
      thumbs_up?: number | boolean;
      thumbs_down?: number | boolean;
      id?: number;
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

    // Set vote status
    let status: 'up' | 'down' | null = null;
    if (historyItem.thumbs_up) status = 'up';
    else if (historyItem.thumbs_down) status = 'down';
    setVoteStatus(status);
    
    setTranslatedError(null);
    setLoading(false);
    loadingRef.current = false;
    
    setCurrentSearchId(null);
    if (historyItem.id) {
      setCurrentHistoryId(historyItem.id);
    }
  }, [setTranslatedError]);


  const vote = useCallback(async (voteType: 'up' | 'down') => {
    // We can vote if we have a historyId OR (searchId and user)
    if (!currentHistoryId && (!currentSearchId || !user?.userId)) return;
    
    try {
      const headers = await getOptionalAuthHeaders();
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          historyId: currentHistoryId, 
          searchId: currentSearchId,
          voteType 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      if (data.historyId) {
        setCurrentHistoryId(data.historyId);
      }
      
      // Update local state to reflect vote
      setVoteStatus(voteType);

    } catch (e) {
      console.error('Error voting:', e);
    }
  }, [currentHistoryId, currentSearchId, user]);

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
    voteStatus,
    currentHistoryId
  };
};
