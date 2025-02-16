// src/components/SimpleMarkdown.tsx
import React from 'react';

interface SimpleMarkdownProps {
  content: string;
}

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return [];

    // Split text into lines, preserving empty lines
    const lines = text.split('\n');

    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={i} className="text-2xl font-bold mb-4">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-bold mb-3">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg font-bold mb-2">
            {line.slice(4)}
          </h3>
        );
      }

      // Lists
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4">
            {line.slice(2)}
          </li>
        );
      }

      // Bold text
      let content = line;
      const boldMatches = content.match(/\*\*(.*?)\*\*/g);
      if (boldMatches) {
        boldMatches.forEach((match) => {
          const text = match.slice(2, -2);
          content = content.replace(match, `<strong>${text}</strong>`);
        });
      }

      // Italic text
      const italicMatches = content.match(/\*(.*?)\*/g);
      if (italicMatches) {
        italicMatches.forEach((match) => {
          const text = match.slice(1, -1);
          content = content.replace(match, `<em>${text}</em>`);
        });
      }

      // If the line is empty, return a line break
      if (!content.trim()) {
        return <br key={i} />;
      }

      // Return paragraph with innerHTML for bold/italic content
      return (
        <p
          key={i}
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    });
  };

  return <div className="prose max-w-none">{parseMarkdown(content)}</div>;
};
