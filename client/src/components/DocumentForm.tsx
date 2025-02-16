import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { useDocuments } from '../hooks/useDocuments';

interface DocumentFormProps {
  folderId: string;
  onClose: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ folderId, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createDocument } = useDocuments(folderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument.mutateAsync({
        title,
        content,
        folderId,
      });
      onClose();
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">Create New Document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="Enter document content (Markdown supported)"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={
                  createDocument.isPending || !title.trim() || !content.trim()
                }
              >
                {createDocument.isPending ? 'Creating...' : 'Create Document'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentForm;
