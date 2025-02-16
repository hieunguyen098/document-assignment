import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { api } from '../services/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH, query],
    queryFn: () => api.searchDocuments(query),
    enabled: query.length > 0,
  });
}
