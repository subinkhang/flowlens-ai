import { useState } from "react";
import { analyzeDiagram } from "../api/analyzeApi";
import type {
  DiagramNode,
  DiagramEdge,
  AnalysisResponse,
} from "../types/ApiResponse";
import { AxiosError } from "axios";

export const useDiagramAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    question?: string
  ): Promise<AnalysisResponse> => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        diagram: { nodes, edges },
        ...(question?.trim() && { question }),
      };

      const response = await analyzeDiagram(payload);
      setAnalysisData(response);
      return response;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Lỗi mạng hoặc máy chủ.";
        setError(message);
        throw new Error(message);
      }

      setError("Lỗi không xác định khi phân tích.");
      throw new Error("Lỗi không xác định khi phân tích.");
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
