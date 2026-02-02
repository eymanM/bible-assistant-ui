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

export async function searchMedia(query: string, language: string = 'en'): Promise<MediaItem[]> {
  if (!query) return [];

  const cacheKey = `${query}:${language}`;

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
        const response = await fetch(`/api/media-search?q=${encodeURIComponent(query)}&lang=${language}`);
        
        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        
        if (Array.isArray(data.images)) {
             return data.images as MediaItem[];
        }

        return [];

    } catch (error) {
        return [];
    } finally {
        pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
