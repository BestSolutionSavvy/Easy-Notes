<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Pdf } from "../types/pdf";
import VuePdfEmbed from "vue-pdf-embed";
import type { Notebook } from "../types/notebook";
import { loadPdf } from "../lib/pdfLoad";
import { calculateFitToContainerScale } from "../lib/pdfScale";

interface Props {
  notebook?: Notebook;
}
const props = defineProps<Props>();

const pdf = ref<Pdf | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const pdfUrl = ref<string | null>(null);
const pdfWidth = ref<number>(0);
const pdfHeight = ref<number>(0);

const loadCurrentPdf = async () => {
  if (
    props.notebook &&
    props.notebook.pages &&
    props.notebook.pages.length > 0
  ) {
    isLoading.value = true;
    error.value = null;
    const lastPage = props.notebook.last_page || 0;
    const pdfId = props.notebook.id_pdf;
    if (pdfId) {
      try {
        pdf.value = await loadPdf(pdfId, lastPage);
        pdfUrl.value = URL.createObjectURL(pdf.value.data);
      } catch (err: any) {
        error.value = err.response?.data?.message || "Failed to load PDF";
        pdf.value = null;
        pdfUrl.value = null;
        console.error("Error loading PDF:", err);
      }
    } else {
      pdf.value = null;
      pdfUrl.value = null;
    }
    isLoading.value = false;
  } else {
    pdf.value = null;
    pdfUrl.value = null;
  }
};

const handleDocumentRender = async (data: any) => {
  const numPages = data.numPages;
  const requestedPage = props.notebook?.last_page || 1;
  const pageNumber = Math.min(Math.max(requestedPage, 1), numPages);
  
  const page = await data.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 })
  const scale = calculateFitToContainerScale(
    viewport.width,
    viewport.height,
    45, // 45vw
    60  // 60vh
  );
  pdfHeight.value = viewport.height * scale / 100;
  pdfWidth.value = viewport.width * scale / 100;
};

watch(
  () => props.notebook,
  () => loadCurrentPdf(),
  { immediate: true },
);
</script>

<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-[10px] bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border gap-[0.625rem] text-center text-[1.25rem] text-darkslategray font-inter">
    <div class="self-stretch overflow-hidden flex items-end py-[0rem] px-[0.625rem]">
      <div class="animate-fade-in overflow-hidden flex items-center justify-center gap-[0.312rem]">
        <img src="../assets/pdf.svg" class="w-[1.25rem] relative max-h-full" alt="" />
        <b class="relative">{{
          props.notebook
            ? pdf?.name || "..."
            : "Select a notebook to preview its PDF file"
        }}</b>
        <div class="h-[1.125rem] w-[0.313rem] relative overflow-hidden shrink-0" />
      </div>
    </div>
    <div class="self-stretch flex-1 overflow-hidden flex flex-col items-start gap-[0.312rem] text-[0.875rem]">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full w-full gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gainsboro-200 border-t-darkslateblue-100"></div>
        <div class="text-gray-500">Loading PDF...</div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full w-full">
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div v-else-if="props.notebook && !pdfUrl"
        class="animate-fade-in flex flex-col items-center justify-center h-full w-full gap-4 p-8">
        <div class="text-6xl">📋</div>
        <div class="text-lg font-medium text-gray-700">No PDF attached</div>
        <div class="text-center text-gray-500 text-sm">
          This notebook doesn't have an associated PDF file
        </div>
      </div>
      <div v-else class="w-[45vw] h-[60vh] relative overflow-auto flex items-center justify-center">
        <div class="pdf-wrapper relative">
          <VuePdfEmbed :width="pdfWidth" :height="pdfHeight" :source="pdfUrl" :text-layer="true"
            @loaded="handleDocumentRender" />
        </div>
      </div>
    </div>
    <div
      class="self-stretch h-[2.313rem] overflow-hidden shrink-0 flex items-start justify-end p-[0.625rem] box-border" />
  </div>
</template>
