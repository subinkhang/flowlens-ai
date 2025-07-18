import { useEffect, useState } from "react";
import { generateDiagram } from "../api/diagramApi";
import type { DiagramResponse } from "../types/ApiResponse";
import { isVietnameseText } from "../utils/isVietnameseText";

// Đặt tên cho khóa localStorage để dễ quản lý
const DIAGRAM_CACHE_KEY = 'flowlens_diagram_cache';

export const useDiagramData = () => {
  const [initialData, setInitialData] = useState<DiagramResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndSetData = async () => {
      // --- STEP 1: KIỂM TRA CACHE TRƯỚC ---
      const cachedData = localStorage.getItem(DIAGRAM_CACHE_KEY);
      if (cachedData) {
        console.log("Tìm thấy dữ liệu sơ đồ trong cache. Đang sử dụng lại...");
        setInitialData(JSON.parse(cachedData));
        setLoading(false);
        return; // Dừng lại ngay lập tức nếu có cache
      }

      // --- STEP 2: NẾU KHÔNG CÓ CACHE, TIẾP TỤC LOGIC CŨ ---
      console.log("Không có cache, bắt đầu fetch dữ liệu mới từ URL...");
      const query = new URLSearchParams(window.location.search);
      const inputType = query.get("type");
      const inputData = query.get("q");

      if (!inputType) {
        setError("Không có loại dữ liệu đầu vào");
        setLoading(false);
        return;
      }

      let text: string | undefined;
      let image: string | undefined;

      if (inputType === "text") {
        if (!inputData) {
          setError("Không có dữ liệu văn bản đầu vào");
          setLoading(false);
          return;
        }
        text = decodeURIComponent(inputData);
      } else if (inputType === "image") {
        const savedImage = sessionStorage.getItem("diagramImage");
        if (!savedImage) {
          setError("Không tìm thấy ảnh đã gửi");
          setLoading(false);
          return;
        }
        image = savedImage.split(",")[1];
      }

      const language = text && isVietnameseText(text) ? "vietnamese" : "english";

      try {
        const data = await generateDiagram({ text, image, language });
        
        // --- STEP 3: LƯU VÀO CACHE SAU KHI GỌI API THÀNH CÔNG ---
        localStorage.setItem(DIAGRAM_CACHE_KEY, JSON.stringify(data));
        console.log("Đã lưu dữ liệu sơ đồ vào cache.");
        
        setInitialData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tạo sơ đồ.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetData();
  }, []); // Vẫn giữ mảng rỗng `[]` để chỉ chạy logic này một lần duy nhất

  return { initialData, error, loading };
};