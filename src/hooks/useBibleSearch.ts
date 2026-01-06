import { useState } from 'react';
import { API_DOMAIN } from '../config/apiConfig';
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
  const { language } = useLanguage();
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
  const { user } = useAuth();
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const search = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
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

      const response = await fetch(`${API_DOMAIN}/search`, {
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
              
              setResults(prev => ({
                ...prev,
                bible: parsed.bible_results || [],
                commentary: parsed.commentary_results || []
              }));
            } catch (e) {
              console.error('Error parsing results:', e);
            }

            if (isFirstData) {
              setLoading(false);
              isFirstData = false;
            }
          } else if (event === 'token' && data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                tempResults.llmResponse += parsed.token;
                setResults(prev => ({
                  ...prev,
                  llmResponse: prev.llmResponse + parsed.token
                }));
              }
            } catch (e) {
              console.error('Error parsing token:', e);
            }
            
            if (isFirstData) {
              setLoading(false);
              isFirstData = false;
            }
          }
        }
      }



      // Save to history if we have results and a user
      if (hasResults && user?.userId) {
        try {
          await fetch('/api/history', {
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
          // Trigger history refresh
          setHistoryRefreshTrigger(prev => prev + 1);
        } catch (e) {
          console.error('Failed to save history:', e);
        }
      }

      // Only deduct credits if AI insights are enabled AND we got results
      if (settings.insights && hasResults && user?.userId) {
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
      setError(err instanceof Error ? err.message : 'An error occurred');
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
    
    setError(null);
    setLoading(false);
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
    historyRefreshTrigger
  };
};
