import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type { Pdf } from "../types/pdf";

export const usePdfStore = defineStore("pdf", () => {
  const selectedPdfId = ref<string | null>(null);
  const selectedPageNumber = ref<number | null>(null);

  const setSelectedPdf = (pdfId: string, page?: number) => {
    selectedPdfId.value = pdfId;
    selectedPageNumber.value = page ?? null;
  };
  const clearSelectedPdf = () => {
    selectedPdfId.value = null;
    selectedPageNumber.value = null;
  };

  const loadPdf = async (pdfId: string, page?: number): Promise<Pdf> => {
    try {
      const metadataResponse = await axios.get(`/api/pdfs/${pdfId}`);
      const metadata = metadataResponse.data;
      const fileResponse = await axios.get(`/api/pdfs/${pdfId}/download`, {
        params: page ? { page } : undefined,
        responseType: 'blob'
      });
      return {
        name: metadata.name,
        date: metadata.date,
        type: metadata.type,
        owner: metadata.owner,
        data: fileResponse.data
      };
    } catch (error: any) {
      console.error("Error loading PDF:", error);
      throw error;
    }
  };

  return {
    selectedPdfId,
    selectedPageNumber,
    setSelectedPdf,
    clearSelectedPdf,
    loadPdf,
  };
});
