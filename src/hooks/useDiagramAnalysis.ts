import { useState } from "react";
import { analyzeDiagram } from "../api/analyzeApi";
import type {
  DiagramNode,
  DiagramEdge,
  AnalysisResponse,
} from "../types/ApiResponse";
import { AxiosError } from "axios";

// --- STEP 1: TẠO HÀM TẠO KHÓA CACHE ---
// Đặt hàm này bên ngoài hook để có thể tái sử dụng và giữ cho hook gọn gàng.
const createAnalysisCacheKey = (payload: object): string => {
  try {
    // Chuyển toàn bộ payload thành chuỗi để tạo hash
    const stateString = JSON.stringify(payload);
    // Thuật toán hash đơn giản nhưng hiệu quả để tạo ra một con số
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Chuyển thành số nguyên 32-bit
    }
    return `analysis_cache_${hash}`;
  } catch {
    // Fallback trong trường hợp có lỗi xảy ra
    return `analysis_cache_default_key`;
  }
};


export const useDiagramAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    selectedDocumentIds: string[], 
    question?: string
  ) => { // Không cần trả về Promise ở đây nữa vì component sẽ nhận dữ liệu qua state
    setLoading(true);
    setError(null);
    setAnalysisData(null); // Xóa dữ liệu cũ để tránh hiển thị kết quả cũ trong thoáng chốc

    // --- STEP 2: TẠO PAYLOAD VÀ KHÓA CACHE ---
    const payload = {
      diagram: { nodes, edges },
      selectedDocumentIds: selectedDocumentIds,
      ...(question?.trim() && { question }),
    };
    
    const cacheKey = createAnalysisCacheKey(payload);
    console.log("Sử dụng cache key cho phân tích:", cacheKey);

    // --- STEP 3: KIỂM TRA CACHE TRƯỚC KHI GỌI API ---
    const cachedResult = localStorage.getItem(cacheKey);
    if (cachedResult) {
      console.log("Tìm thấy kết quả phân tích trong cache. Đang sử dụng lại...");
      const parsedData: AnalysisResponse = JSON.parse(cachedResult);
      setAnalysisData(parsedData);
      setLoading(false);
      return; // Dừng hàm lại ngay tại đây
    }

    // --- STEP 4: GỌI API NẾU KHÔNG CÓ CACHE ---
    console.log("Không có cache. Bắt đầu gọi API phân tích...");
    try {
      const response = await analyzeDiagram(payload);
      console.log('--- [HOOK] --- API trả về response:', response);
      
      // --- STEP 5: LƯU VÀO CACHE SAU KHI CÓ KẾT QUẢ ---
      // Chỉ lưu khi request thành công và có dữ liệu
      if (response) {
        localStorage.setItem(cacheKey, JSON.stringify(response));
        console.log("Đã lưu kết quả phân tích vào cache.");
      }

      setAnalysisData(response);

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || err.message || "Lỗi mạng hoặc máy chủ.";
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Lỗi không xác định khi phân tích.");
      }
      // Không cần throw Error nữa vì component sẽ đọc state `error` để hiển thị lỗi
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