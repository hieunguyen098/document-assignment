export type DocumentFolder = {
  id: string;
  name: string;
  type: 'folder';
};

export type Document = {
  id: string;
  title: string;
  content: string;
  folderId: string;
  createdAt: number;
  updatedAt: number;
};

export type DocumentHistoryEntry = {
  id: string;
  title: string;
  timestamp: number;
};

export type SearchResult = {
  id: string;
  title: string;
  snippet: string;
};

export type NewDocument = {
  title: string;
  content: string;
  folderId: string;
};
