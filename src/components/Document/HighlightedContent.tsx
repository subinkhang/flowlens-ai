import React, { useMemo, useEffect, useRef } from 'react';

interface Props {
  content: string | undefined | null;
  highlight: string | null;
}

// Hàm helper để "bình thường hóa" văn bản
const normalizeTextForComparison = (text: string | null | undefined): string => {
  if (!text) return "";
  return text.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
};

export const HighlightedContent: React.FC<Props> = ({ content, highlight }) => {
  const highlightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (highlightRef.current) {
      // Đặt trong setTimeout để đảm bảo trình duyệt đã vẽ xong trước khi scroll
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlight]);

  const renderedContent = useMemo(() => {
    if (!content) return <p>[Không có nội dung]</p>;
    if (!highlight) return <>{content}</>;
    
    // Tạo regex từ chuỗi highlight đã được làm sạch và thoát ký tự đặc biệt
    const normalizedHighlight = normalizeTextForComparison(highlight);
    const escapedHighlight = normalizedHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');

    // Kiểm tra xem có khớp không trước khi split
    if (!normalizeTextForComparison(content).toLowerCase().includes(normalizedHighlight.toLowerCase())) {
      return <>{content}</>;
    }

    // --- THAY ĐỔI CÁCH SPLIT ---
    // Thay vì split trên content gốc, chúng ta sẽ tìm vị trí và cắt thủ công
    // Hoặc thử một cách split mạnh mẽ hơn
    const parts = content.split(regex);
    
    // Nếu split thành công (mảng có nhiều hơn 1 phần tử), thì map và render
    if (parts.length > 1) {
      let firstMatch = true;
      return (
        <>
          {parts.map((part, index) => {
            // So sánh phần đã được bình thường hóa để quyết định tô màu
            if (normalizeTextForComparison(part).toLowerCase() === normalizedHighlight.toLowerCase()) {
              if (firstMatch) {
                firstMatch = false;
                return <mark key={index} ref={highlightRef}>{part}</mark>;
              }
              return <mark key={index}>{part}</mark>;
            }
            return part;
          })}
        </>
      );
    }

    // Fallback nếu split không hoạt động
    return <>{content}</>;

  }, [content, highlight]);

  return <>{renderedContent}</>;
};