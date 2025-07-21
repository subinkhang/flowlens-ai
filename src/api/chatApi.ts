// src/api/chatApi.ts

// Định nghĩa kiểu dữ liệu cho payload gửi đi để đảm bảo type-safety
interface ChatPayload {
  diagram: {
    nodes: any[];
    edges: any[];
  } | null; // Cho phép gửi null nếu không tìm thấy sơ đồ
  question: string;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  selectedDocumentIds: string[];
}

// Định nghĩa kiểu dữ liệu cho kết quả trả về
interface ChatResponse {
  answer: string;
}

const API_ENDPOINT = 'https://fg9om4dvnk.execute-api.us-east-1.amazonaws.com/prod/chat';

export const askQuestionApi = async (payload: ChatPayload): Promise<ChatResponse> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Nếu server trả về lỗi, ném ra lỗi để catch block có thể xử lý
      const errorData = await response.json();
      throw new Error(errorData.message || 'Server responded with an error');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling chat API:', error);
    // Ném lại lỗi để component có thể xử lý và hiển thị thông báo
    throw error;
  }
};