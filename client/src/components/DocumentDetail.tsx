import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, Trash } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';
import Sidebar from './Sidebar';
import { useDocument, useDocuments } from '../hooks/useDocuments';
import { useHistory } from '../hooks/useHistory';
import { Card, CardContent, CardHeader } from './ui/card';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Fetch document data and mutations
  const { data: document, isLoading, error } = useDocument(id || null);

  const { updateDocument, deleteDocument } = useDocuments(null);
  const { createHistory } = useHistory();

  useEffect(() => {
    if (document) {
      setEditContent(document.content);
      // Update history when document is viewed
      createHistory.mutate({
        id: document.id,
        title: document.title,
      });
    }
  }, [document]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(document?.content || '');
  };

  const handleSave = async () => {
    if (!document) return;

    try {
      await updateDocument.mutateAsync({
        id: document.id,
        content: editContent,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update document:', error);
      // You might want to show an error toast here
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this document?'
    );
    if (!confirmDelete) return;

    try {
      await deleteDocument.mutateAsync(document.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete document:', error);
      // You might want to show an error toast here
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {error ? 'Error loading document' : 'Document not found'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-500 hover:text-blue-600"
            >
              Return to Homepage
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </button>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{document.title}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  Last updated: {new Date(document.updatedAt).toLocaleString()}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-gray-100 rounded text-blue-600 transition-colors duration-200"
                  title="Edit document"
                  disabled={updateDocument.isPending}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-gray-100 rounded text-red-600 transition-colors duration-200"
                  title="Delete document"
                  disabled={deleteDocument.isPending}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Enter document content (Markdown supported)"
                    disabled={updateDocument.isPending}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                      disabled={updateDocument.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                      disabled={updateDocument.isPending}
                    >
                      {updateDocument.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <SimpleMarkdown content={document.content} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
