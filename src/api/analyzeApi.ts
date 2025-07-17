import axios from "../utils/axiosConfig";
import type { AnalysisResponse, SubmitResponse, StatusResponse } from "../types/ApiResponse";
import { AxiosError } from "axios";
import type { DiagramNode, DiagramEdge } from "../types/ApiResponse";
import { API_ENDPOINTS } from "./endpoints";

export interface SubmitJobPayload {
  sessionId: string;
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
  question?: string;
  selectedDocumentIds: string[];
}

export const submitAnalysisJob = async (
  payload: SubmitJobPayload
): Promise<SubmitResponse> => {
  console.log('--- [API LAYER] --- Gửi yêu cầu SUBMIT JOB đến backend:', payload);
  try {
    const response = await axios.post<SubmitResponse>(API_ENDPOINTS.analyzeProcess, payload);
    console.log("✅ Submit job response:", response.data);
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

export const getAnalysisStatus = async (
  jobId: string
): Promise<StatusResponse> => {
  try {
    const endpoint = API_ENDPOINTS.getAnalysisStatus(jobId);
    const response = await axios.get<StatusResponse>(endpoint);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      if (statusCode === 404) {
        throw { message: "Job không tồn tại" };
      } else if (statusCode === 500) {
        throw { message: "Lỗi server" };
      } else {
        throw (error.response?.data ?? { message: "Unknown status check error" });
      }
    } else {
      throw { message: "Unknown status check error" };
    }
  }
};
