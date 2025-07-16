import { useState } from "react";
import { analyzeDiagram } from "../api/analyzeApi";
import type {
  DiagramNode,
  DiagramEdge,
  AnalysisResponse,
} from "../types/ApiResponse";
import { AxiosError } from "axios";

const createAnalysisCacheKey = (payload: object): string => {
  try {
    const stateString = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    // THÊM sessionId vào key (nếu có) để cache là duy nhất cho mỗi phiên
    // @ts-ignore
    const sessionId = payload.sessionId || 'no-session';
    return `analysis_cache_${sessionId}_${hash}`;
  } catch {
    return `analysis_cache_default_key`;
  }
};


export const useDiagramAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HÀM runAnalysis ĐÃ ĐƯỢC MERGE ---
  const runAnalysis = async (
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    selectedDocumentIds: string[],
    question: string,
    sessionId: string
  ): Promise<AnalysisResponse> => {
    
    setLoading(true);
    setError(null);
    setAnalysisData(null);

    const payload = {
      sessionId,
      diagram: { nodes, edges },
      selectedDocumentIds,
      ...(question?.trim() && { question }),
    };

    // Tạo khóa cache từ payload
    const cacheKey = createAnalysisCacheKey(payload);
    console.log("Sử dụng cache key cho phân tích:", cacheKey);

    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
      console.log("Tìm thấy kết quả phân tích trong cache. Đang sử dụng lại...");
      const parsedData: AnalysisResponse = JSON.parse(cachedResult);
      setAnalysisData(parsedData);
      setLoading(false);
      return parsedData; // Trả về dữ liệu từ cache
    }

    console.log("Không có cache. Bắt đầu gọi API phân tích...");
    try {
      const response = await analyzeDiagram(payload);
      console.log('--- [HOOK] --- API trả về response:', response);
      
      if (response) {
        localStorage.setItem(cacheKey, JSON.stringify(response));
        console.log("Đã lưu kết quả phân tích vào cache.");
      }

      setAnalysisData(response);
      return response; // Trả về dữ liệu từ API

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || err.message || "Lỗi mạng hoặc máy chủ.";
        setError(message);
        throw new Error(message); // Vẫn throw Error để component cha có thể bắt
      }

      const errorMessage = (err instanceof Error) ? err.message : "Lỗi không xác định khi phân tích.";
      setError(errorMessage);
      throw new Error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return {
    analysisData,
    loading,
    error,
    runAnalysis,
  };
};