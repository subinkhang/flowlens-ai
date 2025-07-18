/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_DIAGRAM_URL: string;
  readonly VITE_API_DOCUMENTS_PATH: string;
  readonly VITE_API_ANALYZE_URL: string;
  // Thêm các biến khác nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}