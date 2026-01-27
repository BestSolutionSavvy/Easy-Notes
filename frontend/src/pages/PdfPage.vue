<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Notebook } from '../types/notebook';
import { loadPdf } from '../lib/pdfLoad';
import type { Pdf } from '../types/pdf';
import VuePdfEmbed from 'vue-pdf-embed';
import { calculateFitToContainerScale } from '../lib/pdfScale';
import PostIt from '../components/PostIt.vue';

interface Props {
  notebook?: Notebook | null;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  notebook: null,
  currentPage: 0
});


const pdfFile = ref<Pdf | null>(null);
const totalPages = ref<number>(0);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const scale = ref<number>(100);
const basePageWidth = ref<number>(0);
const basePageHeight = ref<number>(0);
const isPostItMode = ref<boolean>(false);
const editingPostItIndex = ref<number | null>(null);
const isDragging = ref<boolean>(false);
const dragStartX = ref<number>(0);
const dragStartY = ref<number>(0);
const dragCurrentX = ref<number>(0);
const dragCurrentY = ref<number>(0);

const dragBox = computed(() => {
  if (!isDragging.value) return null;
  const scaleFactor = scale.value / 100;
  const left = Math.min(dragStartX.value, dragCurrentX.value) / scaleFactor;
  const top = Math.min(dragStartY.value, dragCurrentY.value) / scaleFactor;
  const width = Math.abs(dragCurrentX.value - dragStartX.value) / scaleFactor;
  const height = Math.abs(dragCurrentY.value - dragStartY.value) / scaleFactor;
  return { left, top, width, height };
});

const currentPageData = computed(() => {
  if (!props.notebook) return null;
  return props.notebook.pages?.find(p => p.slide_number === props.currentPage);
});

const currentTextBoxes = computed(() => {
  return currentPageData.value?.text_boxes || [];
});

const pdfUrl = computed(() => pdfFile.value?.data ? URL.createObjectURL(pdfFile.value.data) : null);

const pdfWidth = computed(() => basePageWidth.value > 0 ? basePageWidth.value * scale.value/100 : undefined);
const pdfHeight = computed(() => basePageHeight.value > 0 ? basePageHeight.value * scale.value/100 : undefined);

const emit = defineEmits<{
  (e: 'page-next'): void;
  (e: 'page-prev'): void;
}>();

const handleDocumentRender = async (data: any) => {
  const page = await data.getPage(props.currentPage || 1);
  const viewport = page.getViewport({ scale: 1 })

  basePageWidth.value = viewport.width;
  basePageHeight.value = viewport.height;

  totalPages.value = data.numPages;
  if (props.notebook) {
    props.notebook.num_notebook_pages = data.numPages;
  }
};

const fitToContainer = () => {
  scale.value = calculateFitToContainerScale(
    basePageWidth.value,
    basePageHeight.value,
    45, // 45vw
    60  // 60vh
  );
};

const togglePostItMode = () => {
  isPostItMode.value = !isPostItMode.value;
};

const handlePdfClick = (event: MouseEvent) => {
  if (!isPostItMode.value || !props.notebook) return;
  event.preventDefault();
  event.stopPropagation();
  
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  dragStartX.value = event.clientX - rect.left;
  dragStartY.value = event.clientY - rect.top;
  dragCurrentX.value = dragStartX.value;
  dragCurrentY.value = dragStartY.value;
  isDragging.value = true;
};

const handlePdfMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;
  event.preventDefault();
  
  const pdfWrapper = document.querySelector('.pdf-wrapper') as HTMLElement;
  if (!pdfWrapper) return;
  
  const rect = pdfWrapper.getBoundingClientRect();
  dragCurrentX.value = event.clientX - rect.left;
  dragCurrentY.value = event.clientY - rect.top;
};

const handlePdfMouseUp = (event: MouseEvent) => {
  if (!isDragging.value || !props.notebook) return;
  event.preventDefault();
  
  const box = dragBox.value;
  
  isDragging.value = false;
  
  if (!box || box.width < 30 || box.height < 20) {
    return;
  }
  
  const newPostIt = {
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    content: ''
  };
  
  // Trova o crea la pagina corrente
  let pageData = props.notebook.pages?.find(p => p.slide_number === props.currentPage);
  if (!pageData) {
    pageData = {
      page_number: props.currentPage || 1,
      slide_number: props.currentPage || 1,
      note_content: '',
      text_boxes: [],
      highlights: []
    };
    if (!props.notebook.pages) {
      props.notebook.pages = [];
    }
    props.notebook.pages.push(pageData);
  }
  
  if (!pageData.text_boxes) {
    pageData.text_boxes = [];
  }
  
  pageData.text_boxes.push(newPostIt);
  
  editingPostItIndex.value = pageData.text_boxes.length - 1;
};

const updatePostItContent = (index: number, content: string) => {
  if (!currentPageData.value) return;
  if (!currentPageData.value.text_boxes) return;
  if (!currentPageData.value.text_boxes[index]) return;
  currentPageData.value.text_boxes[index].content = content;
};

const deletePostIt = (index: number) => {
  if (!currentPageData.value) return;
  currentPageData.value.text_boxes.splice(index, 1);
  if (editingPostItIndex.value === index) {
    editingPostItIndex.value = null;
  }
};

onMounted(async () => {
  try {
    pdfFile.value = await loadPdf(props.notebook?.id_pdf || '');
  } catch (err) {
    error.value = 'Failed to load PDF';
    console.error('Error loading PDF:', err);
  }
  
  // Aggiungi listener globali per il drag
  document.addEventListener('mousemove', handlePdfMouseMove);
  document.addEventListener('mouseup', handlePdfMouseUp);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handlePdfMouseMove);
  document.removeEventListener('mouseup', handlePdfMouseUp);
});

</script>

<style scoped>
.post-it-cursor {
  cursor: crosshair;
}
</style>

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
    <div class="self-stretch flex-1 overflow-hidden flex flex-col items-start gap-[0.312rem] text-[0.875rem]">
      <div v-if="isLoading" class="flex items-center justify-center h-full w-full">
        <div class="text-gray-500">Loading PDF...</div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full w-full">
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div v-else-if="!pdfUrl" class="flex items-center justify-center h-full w-full">
        <div class="text-gray-400">Select a notebook to view PDF</div>
      </div>
      <div v-else class="w-[45vw] h-[60vh] relative overflow-auto flex items-center justify-center">
        <div 
          class="pdf-wrapper relative" 
          :class="{ 'post-it-cursor': isPostItMode }" 
          @mousedown="handlePdfClick"
        >
          <VuePdfEmbed :width="pdfWidth" :height="pdfHeight" :source="pdfUrl" :page="currentPage ?? 1" :text-layer="true" @loaded="handleDocumentRender" />
          
          <!-- Preview del box durante il dragging -->
          <div
            v-if="dragBox"
            class="absolute border-2 border-blue-500 bg-blue-100/30 pointer-events-none"
            :style="{
              left: `${dragBox.left * scale / 100}px`,
              top: `${dragBox.top * scale / 100}px`,
              width: `${dragBox.width * scale / 100}px`,
              height: `${dragBox.height * scale / 100}px`
            }"
          ></div>
          
          <!-- Post-it notes -->
          <PostIt
            v-for="(postIt, index) in currentTextBoxes"
            :key="index"
            :content="postIt.content"
            :left="postIt.left"
            :top="postIt.top"
            :width="postIt.width"
            :height="postIt.height"
            :scale="scale"
            @update:content="updatePostItContent(index, $event)"
            @delete="deletePostIt(index)"
          />
        </div>
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
        <img src="../assets/minus.svg" @click = "scale = Math.max(10, scale - 25)"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md">
          <div class="relative">{{ scale }}%</div>
        </div>
        <img src="../assets/plus.svg" @click="scale += 25"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <div class="h-[1.313rem] w-[0.375rem] relative overflow-hidden shrink-0" />
        <img src="../assets/full-size.svg" @click="fitToContainer"
          class="h-[1rem] w-[1rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125" alt="" />
      </div>
      <div class="overflow-hidden flex items-start p-[0.625rem] gap-[0.937rem]">
        <img src="../assets/highlight.svg"
          class="h-[1rem] w-[1.063rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <img src="../assets/post-it-white.svg" @click="togglePostItMode"
          :class="isPostItMode ? 'ring-2 ring-blue-400 rounded' : ''"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
        <img src="../assets/download.svg"
          class="h-[0.938rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt="" />
      </div>
    </div>
  </div>
</template>
