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
    const input = query.get("q");

    if (!input) {
      setError("Không có dữ liệu đầu vào");
      setLoading(false);
      return;
    }
    const language = isVietnameseText(input) ? "vietnamese" : "english";

    generateDiagram({
      text: input,
      language: language,
    })
      .then((data) => setInitialData(data))
      .catch((err) => setError(err.message || "Lỗi khi tạo sơ đồ."))
      .finally(() => setLoading(false));
  }, []);

  return { initialData, error, loading };
};
