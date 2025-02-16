import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { api } from '../services/api';

export function useFolders() {
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({
    queryKey: [QUERY_KEYS.FOLDERS],
    queryFn: api.getFolders,
  });

  const createFolder = useMutation({
    mutationFn: api.addFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: api.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
    },
  });

  return {
    folders: foldersQuery.data ?? [],
    isLoading: foldersQuery.isLoading,
    error: foldersQuery.error,
    createFolder,
    deleteFolder,
  };
}
