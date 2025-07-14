// src/api/endpoints.ts

// Lấy URL gốc từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// THAY ĐỔI: Thêm một bước kiểm tra đầu vào
const createApiUrl = (path?: string): string => { // Thêm `?` để cho phép path có thể là undefined
    // Kiểm tra nếu biến môi trường bị thiếu hoặc không phải là chuỗi
    if (typeof path !== 'string') {
        console.error(`Lỗi cấu hình: Một đường dẫn API trong file .env bị thiếu. Giá trị nhận được: ${path}`);
        // Trả về một chuỗi rỗng hoặc ném lỗi để dễ debug hơn
        return ''; 
    }

    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};

// Định nghĩa và export tất cả các endpoint của bạn
export const API_ENDPOINTS = {
    // Endpoint cho Diagram
    generateDiagram: createApiUrl(import.meta.env.VITE_API_DIAGRAM_PATH),
    
    // Endpoints cho Documents
    getDocuments: createApiUrl(import.meta.env.VITE_API_DOCUMENTS_PATH),
    
    // Endpoint cho Document Detail
    // Đây là một hàm để bạn có thể truyền documentId vào
    getDocumentDetail: (documentId: string) => 
        createApiUrl(`${import.meta.env.VITE_API_DOCUMENTS_PATH}/${documentId}`),

    // Endpoint cho Upload
    // Giả sử đường dẫn upload là "documents/upload"
    uploadDocument: createApiUrl(`${import.meta.env.VITE_API_DOCUMENTS_PATH}/upload`),

    // Endpoint cho Analyze
    analyzeProcess: createApiUrl(import.meta.env.VITE_API_ANALYZE_PATH),
};