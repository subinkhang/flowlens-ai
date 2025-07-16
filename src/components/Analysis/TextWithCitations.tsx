import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CitationSource } from '../../types/ApiResponse';

interface Props {
  text: string | undefined | null;
  sources: CitationSource[];
}

export const TextWithCitations: React.FC<Props> = ({ text, sources }) => {
  if (!text) {
    return <p>Chưa có thông tin</p>;
  }

  // useMemo giúp tối ưu hiệu suất, chỉ tính toán lại khi text hoặc sources thay đổi
  const renderedContent = useMemo(() => {
    // Regex tìm chuỗi (Nguồn [số]) hoặc (Nguon [số]), không phân biệt hoa thường và khoảng trắng
    const citationRegex = /\(Ngu[ồo]n\s*\[(\d+)\]\)/gi;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
      // Các phần tử ở vị trí lẻ trong mảng `parts` chính là các số ID đã được regex bắt
      if (index % 2 === 1) {
        const citationId = parseInt(part, 10);
        const source = sources.find(s => s.citationId === citationId);
        
        if (source) {
          // Xây dựng URL đích với query parameter 'highlight'
          const targetUrl = `/documents/${source.documentId}?highlight=${encodeURIComponent(source.full_retrieved_text)}`;
          
          return (
            <Link 
              key={index} 
              to={targetUrl} 
              className="citation-link" 
              // Tooltip vẫn có thể dùng content_preview cho ngắn gọn
              title={`Trích từ: ${source.title}\n\n"${source.content_preview}"`}
              style={{
                backgroundColor: '#fff59d', // vàng highlight nhẹ
                color: '#000',
                textDecoration: 'none',
                padding: '1px 1px',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              [{citationId}]
            </Link>
          );
        }
        // Nếu không tìm thấy source tương ứng, hiển thị lại chuỗi gốc
        return `(Nguồn [${part}])`; 
      }
      // Các phần tử chẵn là các đoạn văn bản thông thường
      return part;
    });
  }, [text, sources]);

  return <div className="rendered-text-container">{renderedContent}</div>;
};