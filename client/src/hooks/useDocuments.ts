import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { api } from '../services/api';
import { NewDocument } from '../types';

export function useDocuments(folderId: string | null) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: [QUERY_KEYS.DOCUMENTS, folderId],
    queryFn: () =>
      folderId ? api.getDocumentsByFolder(folderId) : Promise.resolve([]),
    enabled: !!folderId,
  });

  const createDocument = useMutation({
    mutationFn: (newDoc: NewDocument) => api.addDocument(newDoc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
    },
  });

  const updateDocument = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.updateDocument(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      queryClient.invalidateQueries({ queryKey: ['document'] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: api.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}

export function useDocument(documentId: string | null) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => (documentId ? api.getDocument(documentId) : null),
    enabled: !!documentId,
  });
}
