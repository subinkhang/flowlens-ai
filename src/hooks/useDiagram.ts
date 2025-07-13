import { useEffect, useState } from "react";
import { generateDiagram } from "../api/diagramApi";
import type { DiagramResponse } from "../types/ApiResponse";
import { isVietnameseText } from "../utils/isVietnameseText";

export interface GenerateDiagramPayload {
  inputType: "text" | "image";
  data: string;
}

export const useDiagramData = () => {
  const [initialData, setInitialData] = useState<DiagramResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
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
      image = savedImage.split(",")[1]; // remove `data:image/...;base64,`
    }

    const language = text && isVietnameseText(text) ? "vietnamese" : "english";

    generateDiagram({ text, image, language })
      .then((data) => setInitialData(data))
      .catch((err) => setError(err.message || "Lỗi khi tạo sơ đồ."))
      .finally(() => setLoading(false));
  }, []);

  return { initialData, error, loading };
};
