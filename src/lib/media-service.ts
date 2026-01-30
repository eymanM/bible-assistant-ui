export interface MediaItem {
  id: string;
  title: string;
  source: string;
  type: 'article' | 'book' | 'video';
  imageUrl?: string;
  url: string;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CSE_KEY;
const GOOGLE_CX = process.env.NEXT_PUBLIC_GOOGLE_CSE_CX;

interface GoogleSearchItem {
  title: string;
  link: string;
  displayLink: string;
  pagemap?: {
    cse_image?: { src: string }[];
    metatags?: { [key: string]: string }[];
  };
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  if (!query) return [];

  // Fallback to empty array if keys are missing (to prevent crash)
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.warn('Google CSE keys are missing. Fetching related media disabled.');
    return [];
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=4`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Google API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.items) return [];

    return data.items.map((item: GoogleSearchItem, index: number) => {
      // Try to extract image
      let imageUrl = undefined;
      if (item.pagemap?.cse_image && item.pagemap.cse_image.length > 0) {
        imageUrl = item.pagemap.cse_image[0].src;
      }

      // Determine source name (simplify displayLink or usage of pagemap)
      let source = item.displayLink;
      if (source.startsWith('www.')) source = source.substring(4);
      
      // Clean up title (remove " - Website Name")
      let title = item.title;
      const separatorIndex = title.lastIndexOf(' - ');
      if (separatorIndex > 0) {
          title = title.substring(0, separatorIndex);
      } else {
         const separatorIndexPipe = title.lastIndexOf(' | ');
         if (separatorIndexPipe > 0) {
             title = title.substring(0, separatorIndexPipe);
         }
      }

      return {
        id: `google-${index}`,
        title: title,
        source: source,
        type: 'article', // Google CSE mainly returns web pages/articles
        imageUrl: imageUrl,
        url: item.link
      };
    });

  } catch (error) {
    console.error('Failed to fetch related media:', error);
    return [];
  }
}
