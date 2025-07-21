import { useEffect, useState } from "react";
// 1. Import các hook cần thiết từ React Router
import { useParams, useSearchParams } from "react-router-dom"; 
import { generateDiagram } from "../api/diagramApi";
import type { DiagramResponse } from "../types/ApiResponse";
import { isVietnameseText } from "../utils/isVietnameseText";

// (Hàm helper để tạo hash đơn giản, giúp khóa cache không quá dài)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
};

export const useDiagramData = () => {
  const [initialData, setInitialData] = useState<DiagramResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Lấy sessionId và các tham số URL bằng hook
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchAndSetData = async () => {
      setLoading(true); // Bắt đầu loading cho mỗi lần chạy
      
      // Kiểm tra điều kiện tiên quyết
      if (!sessionId) {
        setError("Không thể xác định mã phiên làm việc (Session ID).");
        setLoading(false);
        return;
      }

      const inputType = searchParams.get("type");
      const textQuery = searchParams.get("q");
      let dataSourceIdentifier: string | null = null;
      let dynamicCacheKey: string | undefined;

      // 3. Xác định nguồn dữ liệu và tạo khóa cache động
      if (inputType === "image") {
        // Đọc ảnh từ localStorage với khóa động đã tạo ở ChatPage
        const imageStorageKey = `diagram_image_${sessionId}`; 
        const imageData = localStorage.getItem(imageStorageKey);
        if (!imageData) {
          setError("Không tìm thấy dữ liệu ảnh cho phiên này. Vui lòng thử lại.");
          setLoading(false);
          return;
        }
        dataSourceIdentifier = imageData;
      } else if (inputType === "text") {
        if (!textQuery) {
          setError("Không có dữ liệu văn bản đầu vào.");
          setLoading(false);
          return;
        }
        dataSourceIdentifier = decodeURIComponent(textQuery);
      } else {
        setError("URL không hợp lệ, không xác định được loại đầu vào.");
        setLoading(false);
        return;
      }

      // Tạo khóa cache cuối cùng, duy nhất cho yêu cầu này
      // Ví dụ: flowlens_diagram_cache_session-abc-123_xyz987
      dynamicCacheKey = `flowlens_diagram_cache_${sessionId}_${simpleHash(dataSourceIdentifier)}`;

      // --- STEP 1: KIỂM TRA CACHE VỚI KHÓA ĐỘNG ---
      const cachedData = localStorage.getItem(dynamicCacheKey);
      if (cachedData) {
        console.log(`Tìm thấy dữ liệu sơ đồ trong cache với key: ${dynamicCacheKey}`);
        setInitialData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      // --- STEP 2: NẾU KHÔNG CÓ CACHE, GỌI API ---
      console.log(`Không có cache cho key ${dynamicCacheKey}, gọi API mới...`);

      let text: string | undefined;
      let image: string | undefined;
      if (inputType === "text") {
        text = dataSourceIdentifier;
      } else {
        // Lấy phần base64 từ dataSourceIdentifier
        image = dataSourceIdentifier.split(",")[1]; 
      }
      
      const language = text && isVietnameseText(text) ? "vietnamese" : "english";

      try {
        const data = await generateDiagram({ text, image, language });
        
        // --- STEP 3: LƯU VÀO CACHE VỚI KHÓA ĐỘNG ---
        localStorage.setItem(dynamicCacheKey, JSON.stringify(data));
        console.log(`Đã lưu dữ liệu sơ đồ mới vào cache với key: ${dynamicCacheKey}`);
        
        setInitialData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tạo sơ đồ.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetData();
  // 4. Cập nhật dependency array của useEffect
  }, [sessionId, searchParams]); // Chạy lại hook này mỗi khi sessionId hoặc tham số URL thay đổi

  return { initialData, error, loading };
};