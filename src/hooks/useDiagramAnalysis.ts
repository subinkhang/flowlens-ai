import { useState, useCallback, useEffect, useRef } from "react";
import { submitAnalysisJob, getAnalysisStatus } from "../api/analyzeApi";
import type {
  DiagramNode,
  DiagramEdge,
  FullAnalysisResponse
} from "../types/ApiResponse";

const POLLING_INTERVAL = 30000;

const createAnalysisCacheKey = (payload: object): string => {
  try {
    const stateString = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const sessionId = payload.sessionId || 'no-session';
    return `analysis_cache_${sessionId}_${hash}`;
  } catch {
    return `analysis_cache_default_key`;
  }
};

export const useDiagramAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runAnalysis = useCallback(async (
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    selectedDocumentIds: string[], 
    question: string,
    sessionId: string
  ) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);
    setJobId(null);
    setStatusMessage('Bắt đầu phiên phân tích...');

    const payload = { sessionId, diagram: { nodes, edges }, selectedDocumentIds, ...(question?.trim() && { question }) };

    console.log("--- [HOOK DEBUG] PAYLOAD ĐƯỢC TẠO ĐỂ GỬI ĐI ---");
    console.log(JSON.stringify(payload, null, 2));
    if (nodes.length === 0) {
      console.warn("CẢNH BÁO: 'nodes' đang bị rỗng khi gọi runAnalysis!");
    }
    
    const cacheKey = createAnalysisCacheKey(payload);
    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
        console.log("Tìm thấy kết quả hoàn chỉnh trong cache. Hiển thị ngay.");
        setAnalysisData(JSON.parse(cachedResult));
        setIsLoading(false);
        setStatusMessage('Đã tải kết quả từ cache.');
        return;
    }

    try {
      setStatusMessage('Đang gửi yêu cầu đến server...');
      const response = await submitAnalysisJob(payload);
      setJobId(response.jobId); // Lưu lại jobId và kích hoạt useEffect polling
    } catch (err: any) {
      setError(err.message || "Lỗi khi gửi yêu cầu phân tích.");
      setIsLoading(false);
      setStatusMessage('Gửi yêu cầu thất bại.');
    }
  }, []);

  // --- 3. useEffect ĐỂ XỬ LÝ POLLING ---
  useEffect(() => {
    // Dọn dẹp interval cũ nếu có
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Nếu không có jobId, không làm gì cả
    if (!jobId) {
        setIsLoading(false); // Nếu không có job, chắc chắn không loading
        return;
    }

    setStatusMessage('Yêu cầu đã được chấp nhận. Đang chờ xử lý trong nền...');
    
    // Bắt đầu tiến trình polling mới
    intervalRef.current = setInterval(async () => {
      try {
        const response = await getAnalysisStatus(jobId);

        if (response.status === 'COMPLETED') {
          clearInterval(intervalRef.current ?? 0); // Dừng polling
          setAnalysisData(response.result!); // Cập nhật dữ liệu kết quả
          setJobId(null); // Reset jobId
          setStatusMessage('Phân tích hoàn tất!');
          
          // Lưu kết quả cuối cùng vào cache
          const payload = { /* ... cần tạo lại payload nếu muốn cache chính xác ... */ };
          const cacheKey = createAnalysisCacheKey(payload); // Tạm thời dùng payload rỗng
          localStorage.setItem(cacheKey, JSON.stringify(response.result!));

        } else if (response.status === 'FAILED') {
          clearInterval(intervalRef.current  ?? 0); // Dừng polling
          setError(response.error || 'Quá trình phân tích thất bại.');
          setJobId(null);
          setStatusMessage('Quá trình phân tích đã thất bại.');
        } else {
          // Vẫn đang 'PROCESSING', cập nhật thông báo
          setStatusMessage('AI đang phân tích... Vui lòng chờ.');
        }
      } catch (err: any) {
        clearInterval(intervalRef.current ?? 0);
        setError(err.message || 'Lỗi khi kiểm tra trạng thái.');
        setJobId(null);
        setStatusMessage('Mất kết nối với tiến trình phân tích.');
      }
    }, POLLING_INTERVAL);

    // Hàm dọn dẹp khi component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId]); // Chỉ phụ thuộc vào jobId

  return { analysisData, isLoading, error, runAnalysis, statusMessage };
};