<script setup lang="ts">
// import { ref, watch, computed } from "vue";
// import { usePdfStore } from "../stores/pdf-load";
// import type { Pdf } from "../types/pdf";
// import VuePdfEmbed from "vue-pdf-embed";

// interface Props {
//   preview?: boolean;
// }
// const props = withDefaults(defineProps<Props>(), {
//   preview: true,
// });

// const pdfStore = usePdfStore();
// const pdf = ref<Pdf | null>(null);
// const isLoading = ref(false);
// const error = ref<string | null>(null);

// const currentPage = ref(1);
// const totalPages = ref(0);
// const scale = ref(1);
// const pdfUrl = ref<string | null>(null);

// const loadCurrentPdf = async () => {
//   const pdfId = pdfStore.selectedPdfId;
//   const page = pdfStore.selectedPageNumber;
//   if (!pdfId) {
//     pdf.value = null;
//     pdfUrl.value = null;
//     return;
//   }
//   isLoading.value = true;
//   error.value = null;
//   try {
//     pdf.value = await pdfStore.loadPdf(pdfId, page ?? undefined);
//     pdfUrl.value = URL.createObjectURL(pdf.value.data);
//     currentPage.value = page ?? 1;
//   } catch (err: any) {
//     error.value = err.response?.data?.message || "Failed to load PDF";
//     pdf.value = null;
//     pdfUrl.value = null;
//   } finally {
//     isLoading.value = false;
//   }
// };

// watch(
//   () => [pdfStore.selectedPdfId, pdfStore.selectedPageNumber] as const,
//   () => loadCurrentPdf(),
//   { immediate: true }
// );

// const handleDocumentRender = ({ numPages }: { numPages: number }) => {
//   totalPages.value = numPages;
// };

// const previousPage = () => {
//   if (currentPage.value > 1) currentPage.value--;
// };

// const nextPage = () => {
//   if (currentPage.value < totalPages.value) currentPage.value++;
// };

// const zoomIn = () => {
//   scale.value = Math.min(scale.value + 0.25, 3);
// };

// const zoomOut = () => {
//   scale.value = Math.max(scale.value - 0.25, 0.5);
// };

// const toggleFullscreen = () => {
//   const element = document.documentElement;
//   if (!document.fullscreenElement) {
//     element.requestFullscreen();
//   } else {
//     document.exitFullscreen();
//   }
// };

// const downloadPdf = () => {
//   if (!pdf.value) return;
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(pdf.value.data);
//   link.download = pdf.value.name || "document.pdf";
//   link.click();
// };

// const scalePercent = computed(() => Math.round(scale.value * 100));
</script>

<template>
  <!-- <div
    class="h-full flex-1 w-full relative rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-[10px] bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border gap-[0.625rem] text-center text-[1.25rem] text-darkslategray font-inter"
  >
    <div
      class="self-stretch overflow-hidden flex items-end py-[0rem] px-[0.625rem]"
    >
      <div
        class="overflow-hidden flex items-center justify-center gap-[0.312rem]"
      >
        <img
          src="../assets/pdf.svg"
          class="w-[1.25rem] relative max-h-full"
          alt=""
        />
        <b class="relative">{{ pdf?.name || "No PDF Selected" }}</b>
        <div
          class="h-[1.125rem] w-[0.313rem] relative overflow-hidden shrink-0"
        />
        <div
          v-if="totalPages > 0 && !props.preview"
          class="rounded-[5px] [background:linear-gradient(90deg,_#25356e,_#4766d4)] overflow-hidden flex items-center justify-center py-[0.187rem] px-[0.312rem] text-[0.875rem] text-gray-100"
        >
          <div class="relative font-medium">{{ totalPages }} pages</div>
        </div>
      </div>
    </div>
    <div
      class="self-stretch flex-1 overflow-hidden flex flex-col items-start gap-[0.312rem] text-[0.875rem]"
    >
      <div v-if="isLoading" class="flex items-center justify-center h-full w-full">
        <div class="text-gray-500">Loading PDF...</div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full w-full">
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div v-else-if="!pdfUrl" class="flex items-center justify-center h-full w-full">
        <div class="text-gray-400">Select a notebook to view PDF</div>
      </div>
      <div v-else class="self-stretch relative rounded-[10px] flex-1 overflow-auto">
        <VuePdfEmbed
          :source="pdfUrl"
          :page="currentPage"
          :scale="scale"
          @loaded="handleDocumentRender"
        />
      </div>
      <div
        class="self-stretch overflow-hidden flex items-center justify-end py-[0rem] px-[0.687rem]"
      >
        <div class="relative font-medium">{{ currentPage }}/{{ totalPages }}</div>
      </div>
    </div>
    <div
      class="self-stretch h-[2.313rem] overflow-hidden shrink-0 flex items-start justify-end p-[0.625rem] box-border"
    />
    <div
      v-if="!props.preview"
      class="rounded-[10px] [background:linear-gradient(90deg,_#1b264f,_#3e57b5)] overflow-hidden flex items-center py-[0rem] px-[0.625rem] text-[0.75rem] text-gray-700"
    >
      <div
        class="overflow-hidden flex items-center justify-center p-[0.625rem] gap-[0.437rem]"
      >
        <img
          src="../assets/back.svg"
          class="h-[0.875rem] w-[0.5rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage <= 1 }"
          @click="previousPage"
          alt=""
        />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md"
        >
          <div class="relative">{{ currentPage }}/{{ totalPages }}</div>
        </div>
        <img
          src="../assets/next.svg"
          class="h-[0.875rem] w-[0.5rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
          @click="nextPage"
          alt=""
        />
      </div>
      <div
        class="overflow-hidden flex items-center justify-center p-[0.625rem] gap-[0.437rem]"
      >
        <img
          src="../assets/minus.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          @click="zoomOut"
          alt=""
        />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md"
        >
          <div class="relative">{{ scalePercent }}%</div>
        </div>
        <img
          src="../assets/plus.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          @click="zoomIn"
          alt=""
        />
        <div
          class="h-[1.313rem] w-[0.375rem] relative overflow-hidden shrink-0"
        />
        <img
          src="../assets/full-size.svg"
          class="h-[1rem] w-[1rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          @click="toggleFullscreen"
          alt=""
        />
      </div>
      <div class="overflow-hidden flex items-start p-[0.625rem] gap-[0.937rem]">
        <img
          src="../assets/highlight.svg"
          class="h-[1rem] w-[1.063rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <img
          src="../assets/post-it-white.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <img
          src="../assets/download.svg"
          class="h-[0.938rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          @click="downloadPdf"
          alt=""
        />
      </div>
    </div>
  </div> -->
</template>
