import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseOptimisticUpdateOptions<T> {
  queryKey: (string | number)[];
  updateFn: (oldData: T | undefined, newData: Partial<T>) => T;
  revertFn?: (oldData: T | undefined, originalData: T) => T;
}

export function useOptimisticUpdate<T>({
  queryKey,
  updateFn,
  revertFn,
}: UseOptimisticUpdateOptions<T>) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    async (newData: Partial<T>, mutationFn: () => Promise<T>) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<T>(queryKey);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<T>(queryKey, updateFn(previousData, newData));
      }

      try {
        // Perform the actual mutation
        const result = await mutationFn();
        
        // Update with real data
        queryClient.setQueryData<T>(queryKey, result);
        
        return result;
      } catch (error) {
        // If the mutation fails, rollback to the previous value
        if (previousData && revertFn) {
          queryClient.setQueryData<T>(queryKey, revertFn(undefined, previousData));
        } else {
          queryClient.setQueryData<T>(queryKey, previousData);
        }
        throw error;
      }
    },
    [queryClient, queryKey, updateFn, revertFn]
  );

  return { optimisticUpdate };
}