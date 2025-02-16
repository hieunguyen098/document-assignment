// src/components/DocumentList.tsx
import React from 'react';
import { File, Trash, Edit } from 'lucide-react';
import { Document, SearchResult } from '../types';
import { SimpleMarkdown } from './SimpleMarkdown';
import { Card, CardContent, CardHeader } from './ui/card';

interface DocumentListProps {
  documents: (Document | SearchResult)[];
  editingDoc: Document | null;
  onEdit: (doc: Document) => void;
  onDelete: (docId: string) => void;
  onUpdate: (doc: Document) => void;
  onView: (doc: Document) => void;
  onSubmitEdit: (doc: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  editingDoc,
  onEdit,
  onDelete,
  onUpdate,
  onView,
  onSubmitEdit,
}) => {
  const isDocument = (doc: Document | SearchResult): doc is Document => {
    return 'content' in doc;
  };

  const handleContentClick = (doc: Document | SearchResult) => {
    if (isDocument(doc) && editingDoc?.id !== doc.id) {
      onView(doc);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">No documents found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {documents.map((doc) => {
        return (
          <Card
            key={doc.id}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center">
                <File className="w-4 h-4 mr-2" />

                <h3 className="font-semibold">{doc.title}</h3>
              </div>
              {isDocument(doc) && (
                <div className="flex space-x-2">
                  <button
                    className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      editingDoc?.id === doc.id
                        ? onUpdate(editingDoc)
                        : onEdit(doc);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </CardHeader>
            <CardContent
              className="cursor-pointer"
              onClick={() => handleContentClick(doc)}
            >
              {editingDoc?.id === doc.id ? (
                <>
                  <textarea
                    className="w-full h-48 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={editingDoc.content}
                    onChange={(e) =>
                      onUpdate({ ...editingDoc, content: e.target.value })
                    }
                    placeholder="Enter document content (Markdown supported). Press Enter for new line, Ctrl+Enter to save."
                    spellCheck="false"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onSubmitEdit(editingDoc)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : isDocument(doc) ? (
                <SimpleMarkdown content={doc.content} />
              ) : (
                <p className="text-gray-600">{doc.snippet}</p>
              )}
              {isDocument(doc) && (
                <div className="mt-2 text-sm text-gray-500">
                  Last updated: {new Date(doc.updatedAt).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
