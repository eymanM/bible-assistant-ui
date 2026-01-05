import { useState } from 'react';
import { API_DOMAIN } from '../config/apiConfig';
import { useAuth } from '../lib/auth-context';

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

  const search = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResults({ bible: [], commentary: [], llmResponse: '' });

    try {
      const response = await fetch(`${API_DOMAIN}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          settings
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
          }
        }
      }

      // Only deduct credits if AI insights are enabled AND we got results
      if (settings.insights && hasResults) {
        if (!user || !user.userId) {
          throw new Error('You must be logged in to use AI Insights');
        }

        const deductRes = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId })
        });

        if (!deductRes.ok) {
          const errorData = await deductRes.json();
          // If credit deduction fails, show error but keep the results
          console.error('Failed to deduct credits:', errorData.error);
        }
      } else if (settings.insights && !hasResults) {
        // Show message to user that no results were found, so no credits were charged
        setError('No results found for your search. No credits were charged.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    settings,
    setSettings,
    results,
    loading,
    error,
    search
  };
};
