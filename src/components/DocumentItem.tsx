// src/components/DocumentItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Document } from '../types/document';

interface Props {
  document: Document;
  isSelected: boolean;
  onSelectionChange: (documentId: string, isSelected: boolean) => void;
}

const DocumentItem: React.FC<Props> = ({ document, isSelected, onSelectionChange }) => {
  const icon = document.documentType === 'REFERENCE' ? '🌐' : '☁️';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid #eee' }}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelectionChange(document.documentId, e.target.checked)}
      />
      <span style={{ fontSize: '1.5em' }}>{icon}</span>
      <Link to={`/documents/${document.documentId}`} style={{ flexGrow: 1, textDecoration: 'none', color: '#007bff' }}>
        {document.documentName}
      </Link>
    </div>
  );
};

export default DocumentItem;