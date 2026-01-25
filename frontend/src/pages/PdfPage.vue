<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import type { Notebook } from '../types/notebook';
import { loadPdf } from '../lib/pdfLoad';
import type { Pdf } from '../types/pdf';
import VuePdfEmbed from 'vue-pdf-embed';

interface Props {
  notebook?: Notebook | null;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  notebook: null,
  currentPage: 0
});


const pdfFile = ref<Pdf | null>(null);
const currentPdfId = ref<string | null>(null);
const totalPages = ref<number>(0);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const scale = ref<number>(1);

const pdfUrl = computed(() => pdfFile.value?.data ? URL.createObjectURL(pdfFile.value.data) : null);

const emit = defineEmits<{
  (e: 'page-next'): void;
  (e: 'page-prev'): void;
}>();

watch(
  () => props.notebook?.pages?.find(p => p.slide_number === (props.currentPage ?? 0))?.id_pdf,
  async (newPdfId) => {
    if (newPdfId && newPdfId !== currentPdfId.value) {
      isLoading.value = true;
      error.value = null;
      try {
        pdfFile.value = await loadPdf(newPdfId);
        currentPdfId.value = newPdfId;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load PDF';
        pdfFile.value = null;
        console.error("PDF loading error:", e);
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

const handleDocumentRender = ({ numPages }: { numPages: number }) => {
  totalPages.value = numPages;
};

</script>

<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-[10px] bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border gap-[0.625rem] text-center text-[1.25rem] text-darkslategray font-inter">
    <div class="self-stretch overflow-hidden flex items-end py-[0rem] px-[0.625rem]">
      <div class="overflow-hidden flex items-center justify-center gap-[0.312rem]">
        <img src="../assets/pdf.svg" class="w-[1.25rem] relative max-h-full" alt="" />
        <b class="relative">{{ pdfFile?.name || '' }}</b>
        <div class="h-[1.125rem] w-[0.313rem] relative overflow-hidden shrink-0" />
        <div
          class="rounded-[5px] [background:linear-gradient(90deg,_#25356e,_#4766d4)] overflow-hidden flex items-center justify-center py-[0.187rem] px-[0.312rem] text-[0.875rem] text-gray-100">
          <div class="relative font-medium">{{ totalPages }} pages</div>
        </div>
      </div>
    </div>
    <div class="self-stretch flex-1 min-h-0 overflow-hidden flex flex-col items-stretch gap-[0.312rem] text-[0.875rem]">
      <div v-if="isLoading" class="flex items-center justify-center h-full w-full">
        <div class="text-gray-500">Loading PDF...</div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full w-full">
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div v-else-if="!pdfUrl" class="flex items-center justify-center h-full w-full">
        <div class="text-gray-400">Select a notebook to view PDF</div>
      </div>
      <div v-else class="flex-1 w-full min-h-0 rounded-[10px] bg-white flex items-center justify-center overflow-auto">
        <VuePdfEmbed :source="pdfUrl" :page="currentPage ?? 1" @loaded="handleDocumentRender" class="max-w-full max-h-full object-contain" />
      </div>
      <div class="self-stretch overflow-hidden flex items-center justify-end py-[0rem] px-[0.687rem]">
        <div class="relative font-medium">{{ currentPage }}/{{ totalPages }}</div>
      </div>
    </div>
    <div
      class="self-stretch h-[2.313rem] overflow-hidden shrink-0 flex items-start justify-end p-[0.625rem] box-border" />
    <div
      class="rounded-[10px] [background:linear-gradient(90deg,_#1b264f,_#3e57b5)] overflow-hidden flex items-center py-[0rem] px-[0.625rem] text-[0.75rem] text-gray-700">
      <div class="overflow-hidden flex items-center justify-center p-[0.625rem] gap-[0.437rem]">
        <img src="../assets/back.svg" @click="$emit('page-prev')"
          class="h-[0.875rem] w-[0.5rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md">
          <div class="relative">{{ currentPage }}/{{ totalPages }}</div>
        </div>
        <img src="../assets/next.svg" @click="$emit('page-next')"
          class="h-[0.875rem] w-[0.5rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125" />
      </div>
      <div class="overflow-hidden flex items-center justify-center p-[0.625rem] gap-[0.437rem]">
        <img src="../assets/minus.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md">
          <div class="relative">{{ scale }}%</div>
        </div>
        <img src="../assets/plus.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <div class="h-[1.313rem] w-[0.375rem] relative overflow-hidden shrink-0" />
        <img src="../assets/full-size.svg"
          class="h-[1rem] w-[1rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125" alt="" />
      </div>
      <div class="overflow-hidden flex items-start p-[0.625rem] gap-[0.937rem]">
        <img src="../assets/highlight.svg"
          class="h-[1rem] w-[1.063rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <img src="../assets/post-it-white.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <img src="../assets/download.svg"
          class="h-[0.938rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
      </div>
    </div>
  </div>
</template>
