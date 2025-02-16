// src/services/api.ts
import {
  Document,
  DocumentFolder,
  DocumentHistoryEntry,
  SearchResult,
  NewDocument,
} from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
};

export const api = {
  // Folder APIs
  getFolders: async (): Promise<DocumentFolder[]> => {
    const response = await fetch(`${API_BASE_URL}/folders`);
    return handleResponse(response);
  },

  getDocumentsByFolder: async (folderId: string): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/folders/${folderId}`);
    return handleResponse(response);
  },

  addFolder: async (name: string): Promise<DocumentFolder> => {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },

  deleteFolder: async (id: string): Promise<{ status: 'deleted' }> => {
    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Document APIs
  getDocument: async (id: string): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`);
    return handleResponse(response);
  },

  addDocument: async (doc: NewDocument): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return handleResponse(response);
  },

  updateDocument: async (id: string, content: string): Promise<Document> => {
    // Note: Using PATCH instead of PUT as per the routes
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  deleteDocument: async (id: string): Promise<{ status: 'deleted' }> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Search API
  searchDocuments: async (query: string): Promise<SearchResult[]> => {
    const response = await fetch(
      `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`
    );
    return handleResponse(response);
  },

  // History APIs
  getHistory: async (): Promise<DocumentHistoryEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/history`);
    return handleResponse(response);
  },

  addHistory: async (entry: {
    id: string;
    title: string;
  }): Promise<{ status: 'added' }> => {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return handleResponse(response);
  },
};
