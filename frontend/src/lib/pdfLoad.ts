import axios from "axios";
import type { Pdf } from "../types/pdf";

export const loadPdf = async (
  pdfId: string,
  page?: number,
): Promise<Pdf> => {
  try {
    const metadataResponse = await axios.get(`/api/pdfs/${pdfId}`);
    const metadata = metadataResponse.data;
    const fileResponse = await axios.get(`/api/pdfs/${pdfId}/download`, {
      params: page ? { page } : undefined,
      responseType: "blob",
    });
    return {
      name: metadata.name,
      date: metadata.date,
      type: metadata.type,
      owner: metadata.owner,
      data: fileResponse.data,
    };
  } catch (error: any) {
    console.error("Error loading PDF:", error);
    throw error;
  }
};
