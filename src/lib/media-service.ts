export interface MediaItem {
  id: string;
  title: string;
  source: string;
  type: 'article' | 'book' | 'video';
  imageUrl?: string;
  url: string;
}

interface SerperImageItem {
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  source: string;
  domain: string;
  link: string;
  googleUrl: string;
  position: number;
}

const pendingRequests = new Map<string, Promise<MediaItem[]>>();

import { getOptionalAuthHeaders } from './auth-helpers';

export async function searchMedia(query: string, language: string = 'en'): Promise<MediaItem[]> {
  if (!query) return [];

  const cacheKey = `${query}:${language}`;

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
        const headers = await getOptionalAuthHeaders();
        const queryParams = new URLSearchParams({
            q: query,
            lang: language
        });
        
        const response = await fetch(`/api/media-search?${queryParams.toString()}`, {
            headers
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Media search failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data.images)) {
             return data.images as MediaItem[];
        }

        return [];

    } catch (error) {
        throw error;
    } finally {
        pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
