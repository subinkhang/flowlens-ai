import axios from "../utils/axiosConfig";
import type { DiagramResponse } from "../types/ApiResponse";
import { AxiosError } from "axios";

const DIAGRAM_API = import.meta.env.VITE_API_DIAGRAM_URL;

export interface GenerateDiagramPayload {
  text?: string;
  image?: string; // base64
  language?: string;
}

export const generateDiagram = async (
  payload: GenerateDiagramPayload
): Promise<DiagramResponse> => {
  try {
    console.log(
      "Sending request to:",
      `${import.meta.env.VITE_API_BASE_URL}/${DIAGRAM_API}`
    );
    console.log("📦 Request body:", payload);

    const response = await axios.post<DiagramResponse>(DIAGRAM_API, payload);

    console.log("Response:", response.data);

    if (!response.data.success) {
      throw new Error("API response unsuccessful");
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw (
        error.response?.data ?? { message: "Unknown error", code: "UNKNOWN" }
      );
    }

    console.error("Unexpected error:", error);
    throw { message: "Unknown error", code: "UNKNOWN" };
  }
};
