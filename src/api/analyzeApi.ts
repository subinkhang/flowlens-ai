import axios from "../utils/axiosConfig";
import type { AnalysisResponse } from "../types/ApiResponse";
import { AxiosError } from "axios";
import type { DiagramNode, DiagramEdge } from "../types/ApiResponse";

const ANALYZE_API = import.meta.env.VITE_API_ANALYZE_URL;

export interface AnalyzeDiagramPayload {
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  question?: string;
}

export const analyzeDiagram = async (
  payload: AnalyzeDiagramPayload
): Promise<AnalysisResponse> => {
  console.log('--- [API LAYER] --- Gửi payload đến backend:', payload);
  try {
    console.log("📤 Sending analysis request to:", ANALYZE_API);
    console.log("📦 Request body:", payload);

    const response = await axios.post<AnalysisResponse>(ANALYZE_API, payload);

    console.log("✅ Analysis response:", response.data);

    if (!response.data.success) {
      throw new Error("API response unsuccessful");
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("❌ Axios error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw (
        error.response?.data ?? { message: "Unknown error", code: "UNKNOWN" }
      );
    }
    console.error("❌ Unexpected error:", error);
    throw { message: "Unknown error", code: "UNKNOWN" };
  }
};
