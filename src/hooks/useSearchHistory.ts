
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth-context';
import { getAuthHeaders } from '../lib/auth-helpers';

interface HistoryItem {
  id: number;
  query: string;
  response?: string;
  bible_results?: string[];
  commentary_results?: string[];
}

interface FetchResponse {
  history: HistoryItem[];
}

export const useSearchHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['searchHistory', user?.userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user?.userId) return { history: [] };
      
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/history?limit=20&offset=${pageParam}`,
        { headers }
      );
      
      if (!res.ok) {
        throw new Error('Failed to fetch history');
      }
      
      return res.json() as Promise<FetchResponse>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce(
        (acc, page) => acc + page.history.length, 
        0
      );
      
      // If we got fewer items than limit (20), we're done
      if (lastPage.history.length < 20) return undefined;
      
      return currentCount;
    },
    enabled: !!user?.userId,
    // Keep data fresh for 1 minute, but cached for longer
    staleTime: 60 * 1000, 
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!user?.userId) throw new Error('User not authenticated');
      
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete history item');
      }
      
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ 
        queryKey: ['searchHistory', user?.userId] 
      });

      const previousData = queryClient.getQueryData(['searchHistory', user?.userId]);

      queryClient.setQueryData(
        ['searchHistory', user?.userId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              history: page.history.filter((item: HistoryItem) => item.id !== deletedId),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(
        ['searchHistory', user?.userId], 
        context.previousData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['searchHistory', user?.userId] 
      });
    },
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.history) || [],
    deleteItem: deleteMutation.mutate,
  };
};
