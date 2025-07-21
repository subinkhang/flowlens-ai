export const getLatestDiagramForSession = (sessionId: string): { nodes: any[], edges: any[] } | null => {
  if (!sessionId) return null;

  // 1. Lấy tất cả các khóa từ localStorage
  const allKeys = Object.keys(localStorage);

  // 2. Tìm khóa cache sơ đồ thuộc về session này
  // Chúng ta giả định khóa gần nhất sẽ là khóa phù hợp. 
  // Trong thực tế, có thể cần một cơ chế phức tạp hơn nếu một session có nhiều sơ đồ.
  const diagramKey = allKeys.find(key => key.startsWith(`flowlens_diagram_cache_${sessionId}`));

  if (diagramKey) {
    const cachedItem = localStorage.getItem(diagramKey);
    if (cachedItem) {
      try {
        const parsedData = JSON.parse(cachedItem);
        // Trả về đúng cấu trúc mà API cần
        if (parsedData && parsedData.diagram) {
            return parsedData.diagram;
        }
      } catch (e) {
        console.error("Lỗi khi parse dữ liệu sơ đồ từ cache:", e);
        return null;
      }
    }
  }

  console.warn(`Không tìm thấy sơ đồ nào trong cache cho session: ${sessionId}`);
  return null;
};