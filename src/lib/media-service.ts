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

// In-memory deduplication map: key = "query:lang", value = Promise<MediaItem[]>
const deduplicationMap = new Map<string, Promise<MediaItem[]>>();

export async function searchMedia(query: string, language: string = 'en'): Promise<MediaItem[]> {
  if (!query) return [];

  const dedupKey = `${query}:${language}`;

  // 1. Check in-memory deduplication
  if (deduplicationMap.has(dedupKey)) {
    return deduplicationMap.get(dedupKey)!;
  }

  // 2. Create a new promise for this request
  const searchPromise = (async () => {
    try {
        const response = await fetch(`/api/media-search?q=${encodeURIComponent(query)}&lang=${language}`);
        
        if (!response.ok) {
            console.warn(`Media Search API error: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        
        // API now returns { images: MediaItem[], cached: boolean }
        if (Array.isArray(data.images)) {
             return data.images as MediaItem[];
        }

        return [];

    } catch (error) {
        console.error('Failed to fetch related media:', error);
        return [];
    } finally {
        // 3. Cleanup deduplication map
        deduplicationMap.delete(dedupKey);
    }
  })();

  deduplicationMap.set(dedupKey, searchPromise);
  return searchPromise;
}
