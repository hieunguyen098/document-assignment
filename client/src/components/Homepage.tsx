import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { SimpleMarkdown } from './SimpleMarkdown';
import Sidebar from './Sidebar';
import { useDocuments } from '../hooks/useDocuments';
import { useHistory } from '../hooks/useHistory';
import { useSearch } from '../hooks/useSearch';
import { Document, SearchResult } from '../types';
import DocumentForm from './DocumentForm';

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);

  // Use selectedFolder in useDocuments hook
  const {
    documents,
    createDocument,
    isLoading: isLoadingDocs,
  } = useDocuments(selectedFolder);
  const { createHistory } = useHistory();
  const { data: searchResults, isLoading: isSearching } =
    useSearch(searchQuery);

  // Type guard to check if item is Document
  const isDocument = (item: Document | SearchResult): item is Document => {
    return 'updatedAt' in item;
  };

  // Handle document click and update history
  const handleDocumentClick = async (docId: string, docTitle: string) => {
    try {
      await createHistory.mutateAsync({
        id: docId,
        title: docTitle,
      });
      navigate(`/documents/${docId}`);
    } catch (error) {
      console.error('Error updating history:', error);
    }
  };

  // Handle folder selection from Sidebar
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setSearchQuery(''); // Clear search when changing folders
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSelectedFolder(null);
    }
  };

  // Determine which documents to display based on search
  const displayedDocuments = searchQuery ? searchResults : documents;
  const isLoading = isLoadingDocs || (searchQuery && isSearching);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          onFolderSelect={handleFolderSelect}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        onFolderSelect={setSelectedFolder}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : selectedFolder
                ? 'Folder Documents'
                : 'All Documents'}
            </h1>
            {selectedFolder && !searchQuery && (
              <button
                onClick={() => setIsCreatingDocument(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {displayedDocuments?.map((doc) => (
              <Card
                key={doc.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDocumentClick(doc.id, doc.title)}
              >
                <CardHeader>
                  <h3 className="text-lg font-semibold">{doc.title}</h3>
                  {isDocument(doc) && (
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(doc.updatedAt).toLocaleString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 line-clamp-3">
                    {isDocument(doc) ? (
                      <SimpleMarkdown content={doc.content} />
                    ) : (
                      <p>{doc.snippet}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {displayedDocuments?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery
                  ? `No documents found matching "${searchQuery}"`
                  : selectedFolder
                  ? 'No documents in this folder'
                  : 'No documents found'}
              </p>
            </div>
          )}
        </div>

        {isCreatingDocument && selectedFolder && (
          <DocumentForm
            folderId={selectedFolder}
            onClose={() => setIsCreatingDocument(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Homepage;
