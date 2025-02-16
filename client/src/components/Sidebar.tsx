import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, Search, Clock, Trash, FolderPlus } from 'lucide-react';
import { useFolders } from '../hooks/useFolders';
import { useHistory } from '../hooks/useHistory';
import { useSearch } from '../hooks/useSearch';
import { useDocuments } from '../hooks/useDocuments';

interface SidebarProps {
  onFolderSelect?: (folderId: string | null) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onFolderSelect,
  onSearch,
  searchQuery = '',
}) => {
  const navigate = useNavigate();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Query hooks
  const { folders, createFolder, deleteFolder } = useFolders();
  const { history, createHistory } = useHistory();
  const { documents } = useDocuments(selectedFolder);

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder.mutateAsync(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  // Handle folder click
  const handleFolderClick = useCallback(
    (folderId: string) => {
      const newSelectedId = selectedFolder === folderId ? null : folderId;
      setSelectedFolder(newSelectedId);
      onFolderSelect?.(newSelectedId);
      if (onSearch) {
        onSearch(''); // Clear search when selecting folder
      }
      navigate('/');
    },
    [selectedFolder, onFolderSelect, onSearch, navigate]
  );

  // Handle search
  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
      if (query.trim()) {
        setSelectedFolder(null);
        onFolderSelect?.(null);
      }
    }
  };

  // Handle recent document click
  const handleRecentDocumentClick = async (id: string, title: string) => {
    try {
      await createHistory.mutateAsync({ id, title });
      navigate(`/documents/${id}`);
    } catch (error) {
      console.error('Error navigating to document:', error);
    }
  };

  // Format timestamp for recent documents
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Folders Section */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Folders
            </h2>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {isCreatingFolder && (
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <input
                type="text"
                placeholder="Folder name"
                className="w-full p-2 text-sm border rounded mb-2"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={!newFolderName.trim() || createFolder.isPending}
                >
                  {createFolder.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`group flex items-center px-3 py-2 rounded-md cursor-pointer ${
                  selectedFolder === folder.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <button
                  className="flex items-center flex-1"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm truncate">{folder.name}</span>
                  {selectedFolder === folder.id && documents && (
                    <span className="ml-2 text-xs">({documents.length})</span>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder.mutate(folder.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                  disabled={deleteFolder.isPending}
                >
                  <Trash className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Recent Documents
        </h2>

        <div className="space-y-1 max-h-48 overflow-auto">
          {history.map((doc) => (
            <button
              key={`${doc.id}-${doc.timestamp}`}
              className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-50 text-left group"
              onClick={() => handleRecentDocumentClick(doc.id, doc.title)}
            >
              <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate group-hover:text-blue-600">
                  {doc.title}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(doc.timestamp)}
                </p>
              </div>
            </button>
          ))}

          {history.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No recent documents
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
