// src/api/endpoints.ts

// Lấy URL gốc từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lấy các đường dẫn (paths) từ .env
const DIAGRAM_PATH = import.meta.env.VITE_API_DIAGRAM_URL; // Sửa _URL thành _PATH trong .env để nhất quán
const ANALYZE_PATH = import.meta.env.VITE_API_ANALYZE_URL;   // Sửa _URL thành _PATH trong .env để nhất quán
const DOCS_PATH = import.meta.env.VITE_API_DOCUMENTS_PATH;

// THAY ĐỔI: Thêm một bước kiểm tra đầu vào
const createApiUrl = (path?: string): string => {
    // Kiểm tra xem URL gốc có tồn tại không
    if (!API_BASE_URL) {
        throw new Error("Lỗi cấu hình: VITE_API_BASE_URL không được định nghĩa trong file .env");
    }
    // Kiểm tra xem đường dẫn con có tồn tại không
    if (typeof path !== 'string') {
        throw new Error(`Lỗi cấu hình: Đường dẫn API bị thiếu hoặc không phải là chuỗi. Giá trị nhận được: ${path}`);
    }

    // Kết hợp lại để tạo URL hoàn chỉnh
    return `${API_BASE_URL}/${path}`;
};

// Định nghĩa và export tất cả các endpoint của bạn
export const API_ENDPOINTS = {
    // Endpoint cho Diagram
    generateDiagram: createApiUrl(DIAGRAM_PATH),
    
    // Endpoint cho Analyze
    analyzeProcess: createApiUrl(ANALYZE_PATH),

    getAnalysisStatus: (jobId: string): string => {
        // Giả sử bạn sẽ tạo một resource mới là 'analysis-status'
        const STATUS_PATH = import.meta.env.VITE_API_STATUS_PATH || 'analysis-status';
        return createApiUrl(`${STATUS_PATH}/${jobId}`);
    },

    // == Endpoints cho Quản lý Tài liệu ==

    // GET /documents
    getDocuments: createApiUrl(DOCS_PATH),

    // POST /documents/upload
    uploadDocument: createApiUrl(`${DOCS_PATH}/upload`),

    // GET /documents/{documentId}
    // Đây là một hàm để bạn có thể truyền documentId vào một cách linh hoạt
    getDocumentById: (documentId: string): string => {
        return createApiUrl(`${DOCS_PATH}/${documentId}`);
    }
};