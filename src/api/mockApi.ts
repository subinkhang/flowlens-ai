// Đóng vai trò là cơ sở dữ liệu tạm thời trong bộ nhớ
const sessions: Record<string, any> = {};

// Hàm xử lý tạo diagram và lưu vào session
const handleDiagram = (sessionId: string, payload: string) => {
  console.log(`[API] Tạo diagram cho session: ${sessionId}`);
  const diagramData = {
    nodes: [
      {
        id: "1",
        type: "input",
        data: { label: `Input: "${payload}"` },
        position: { x: 250, y: 5 },
      },
      { id: "2", data: { label: "AI xử lý..." }, position: { x: 250, y: 100 } },
    ],
    edges: [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        type: "custom",
        markerEnd: { type: "arrowclosed" },
      },
    ],
  };

  // Lưu vào "database"
  if (!sessions[sessionId]) sessions[sessionId] = {};
  sessions[sessionId].diagram = diagramData;

  return {
    action: "NAVIGATE_TO_DIAGRAM",
    sessionId: sessionId,
    message: "Đã tạo sơ đồ. Mở tab mới để xem và chỉnh sửa.",
  };
};

// Hàm xử lý yêu cầu cải tiến, đọc từ session
const handleImprove = (sessionId: string) => {
  console.log(`[API] Phân tích cho session: ${sessionId}`);
  if (!sessions[sessionId] || !sessions[sessionId].diagram) {
    return {
      action: "DISPLAY_TEXT",
      message:
        "Lỗi: Không tìm thấy sơ đồ nào trong phiên làm việc này để phân tích. Hãy dùng @diagram trước.",
    };
  }

  const analysisData = {
    summary: `Đây là phân tích cho quy trình có ${sessions[sessionId].diagram.nodes.length} bước.`,
    suggestions: ["Gợi ý 1: ..."],
    risks: ["Rủi ro 1: ..."],
  };

  sessions[sessionId].analysis = analysisData;

  return {
    action: "NAVIGATE_TO_ANALYSIS",
    sessionId: sessionId,
    message: "Đã phân tích chuyên sâu. Mở tab mới để xem báo cáo.",
  };
};

// API chính để chat
export const mockApiCall = (
  tag: string,
  payload: string,
  sessionId: string
): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (tag) {
        case "@diagram":
          resolve(handleDiagram(sessionId, payload));
          break;
        case "@improve":
          resolve(handleImprove(sessionId));
          break;
        case "@ask":
          resolve({
            action: "DISPLAY_TEXT",
            message: `Đã nhận câu hỏi cho session ${sessionId}.`,
          });
          break;
        default:
          resolve({
            action: "DISPLAY_TEXT",
            message: "Lệnh không hợp lệ. Hãy dùng @diagram, @ask, @improve.",
          });
          break;
      }
    }, 1000);
  });
};

// API MỚI: để các trang con (diagram, analysis) lấy dữ liệu của mình
export const getSessionData = (
  sessionId: string,
  dataType: "diagram" | "analysis"
): Promise<any> => {
  console.log(`[API] Lấy dữ liệu '${dataType}' cho session: ${sessionId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (sessions[sessionId] && sessions[sessionId][dataType]) {
        resolve(sessions[sessionId][dataType]);
      } else {
        reject(
          new Error(`Không tìm thấy dữ liệu '${dataType}' cho session ID này.`)
        );
      }
    }, 500);
  });
};
