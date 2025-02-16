import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { api } from '../services/api';
import { DocumentHistoryEntry } from '../types';

export function useHistory() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: [QUERY_KEYS.HISTORY],
    queryFn: api.getHistory,
    select: (data: DocumentHistoryEntry[]) => {
      // Create a Map to keep only the most recent entry for each document
      const uniqueEntries = new Map<string, DocumentHistoryEntry>();

      // Process entries to keep only the most recent for each document
      data.forEach((entry) => {
        const existingEntry = uniqueEntries.get(entry.id);
        if (!existingEntry || entry.timestamp > existingEntry.timestamp) {
          uniqueEntries.set(entry.id, entry);
        }
      });

      // Convert Map values to array and sort by timestamp
      return Array.from(uniqueEntries.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5); // Keep only 5 most recent entries
    },
  });

  const createHistory = useMutation({
    mutationFn: api.addHistory,
    onMutate: async (newEntry: { id: string; title: string }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.HISTORY] });

      // Get current history
      const previousHistory =
        queryClient.getQueryData<DocumentHistoryEntry[]>([
          QUERY_KEYS.HISTORY,
        ]) ?? [];

      // Create new history entry
      const newHistoryEntry: DocumentHistoryEntry = {
        id: newEntry.id,
        title: newEntry.title,
        timestamp: Date.now(),
      };
      // Remove any previous entry of this document
      const filteredHistory = previousHistory.filter(
        (entry) => entry.id !== newEntry.id
      );

      // Add new entry at the start and keep only 5 items
      const updatedHistory = [newHistoryEntry, ...filteredHistory].slice(0, 5);

      queryClient.setQueryData<DocumentHistoryEntry[]>(
        [QUERY_KEYS.HISTORY],
        updatedHistory
      );
      return { previousHistory };
    },
    onError: (err, newEntry, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData<DocumentHistoryEntry[]>(
          [QUERY_KEYS.HISTORY],
          context.previousHistory
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
    },
  });

  return {
    history: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
    createHistory,
    queryClient,
  };
}
