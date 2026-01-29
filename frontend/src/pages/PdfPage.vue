<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
const pdfTemplateRef = ref<InstanceType<typeof VuePdfEmbed> | null>(null);
const totalPages = ref<number>(0);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const scale = ref<number>(100);
const basePageWidth = ref<number>(0);
const basePageHeight = ref<number>(0);
const isPostItMode = ref<boolean>(false);
const isHighlightMode = ref<boolean>(false);
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

const currentTextBoxes = computed(() => currentPageData.value?.text_boxes || []);
const currentHighlights = computed(() => currentPageData.value?.highlights || []);
const pdfUrl = computed(() => pdfFile.value?.data ? URL.createObjectURL(pdfFile.value.data) : null);
const pdfWidth = computed(() => basePageWidth.value > 0 ? basePageWidth.value * scale.value / 100 : undefined);
const pdfHeight = computed(() => basePageHeight.value > 0 ? basePageHeight.value * scale.value / 100 : undefined);

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
  if (isPostItMode.value) {
    isHighlightMode.value = false;
  }
};

const toggleHighlightMode = () => {
  isHighlightMode.value = !isHighlightMode.value;
  if (isHighlightMode.value) {
    isPostItMode.value = false;
  }
};

const handlePdfClick = (event: MouseEvent) => {
  if (isPostItMode.value && props.notebook) {
    event.preventDefault();
    event.stopPropagation();
    const pdfWrapper = document.querySelector('.pdf-wrapper') as HTMLElement;
    if (pdfWrapper) {
      const rect = pdfWrapper.getBoundingClientRect();
      dragStartX.value = event.clientX - rect.left;
      dragStartY.value = event.clientY - rect.top;
      dragCurrentX.value = dragStartX.value;
      dragCurrentY.value = dragStartY.value;
      isDragging.value = true;
    }
  }
};

const handlePdfMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    event.preventDefault();
    const pdfWrapper = document.querySelector('.pdf-wrapper') as HTMLElement;
    if (pdfWrapper) {
      const rect = pdfWrapper.getBoundingClientRect();
      dragCurrentX.value = event.clientX - rect.left;
      dragCurrentY.value = event.clientY - rect.top;
    }
  }
};

const saveHighlight = () => {
  if (props.notebook) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const pdfWrapper = document.querySelector('.pdf-wrapper') as HTMLElement;
        const textLayer = pdfWrapper?.querySelector('.textLayer') as HTMLElement;
        const textLayerRect = textLayer.getBoundingClientRect();
        if (pdfWrapper && textLayer) {
          for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            if (rect) {
              if (rect.width > 1 && rect.height > 1) {
                const relativeLeft = rect.left - textLayerRect.left;
                const relativeTop = rect.top - textLayerRect.top
                const newHighlight = {
                  left: relativeLeft,
                  top: relativeTop,
                  width: rect.width,
                  height: rect.height,
                  content: selection.toString()
                };
                if (!currentPageData.value) {
                  props.notebook.pages = props.notebook.pages || [];
                  props.notebook.pages.push({
                    page_number: props.currentPage || 1,
                    slide_number: props.currentPage || 1,
                    note_content: '',
                    text_boxes: [],
                    highlights: []
                  });
                }
                if (currentPageData.value) {
                  let intesrects = false;
                  for (const existingHighlight of currentPageData.value.highlights) {
                    const x_overlap = Math.max(0, Math.min(existingHighlight.left + existingHighlight.width, newHighlight.left + newHighlight.width) - Math.max(existingHighlight.left, newHighlight.left));
                    const y_overlap = Math.max(0, Math.min(existingHighlight.top + existingHighlight.height, newHighlight.top + newHighlight.height) - Math.max(existingHighlight.top, newHighlight.top));
                    const overlapArea = x_overlap * y_overlap;
                    const newHighlightArea = newHighlight.width * newHighlight.height;
                    if (overlapArea / newHighlightArea > 0.5) {
                      intesrects = true;
                      break;
                    }
                  }
                  if (!intesrects) {
                    currentPageData.value.highlights.push(newHighlight);
                  }
                }
              }
            }
          }
          selection.removeAllRanges();
        }
      }
    }
  }
};

const savePostIt = () => {
  if (props.notebook) {
    const box = dragBox.value;
    isDragging.value = false;
    if (box && box.width >= 30 && box.height >= 20) {
      let pageData = currentPageData.value;
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
      if (isPostItMode.value) {
        const newPostIt = {
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          content: ''
        };

        if (!pageData.text_boxes) {
          pageData.text_boxes = [];
        }
        pageData.text_boxes.push(newPostIt);
        editingPostItIndex.value = pageData.text_boxes.length - 1;
        isPostItMode.value = false;
      }
    }
  }
};

const handlePdfMouseUp = (event: MouseEvent) => {
  if (isHighlightMode.value) {
    saveHighlight();
  } else if (isPostItMode.value) {
    event.preventDefault();
    savePostIt();
  }
};

const updatePostItContent = (index: number, content: string) => {
  if (currentPageData.value && currentPageData.value.text_boxes && currentPageData.value.text_boxes[index]) {
    currentPageData.value.text_boxes[index].content = content;
  }
};


const deletePostIt = (index: number) => {
  if (currentPageData.value) {
    currentPageData.value.text_boxes.splice(index, 1);
    if (editingPostItIndex.value === index) {
      editingPostItIndex.value = null;
    }
  }
};

const deleteHighlight = (index: number) => {
  if (currentPageData.value && currentPageData.value.highlights) {
    currentPageData.value.highlights.splice(index, 1);
  }
};

const loadPdfFile = async (pdfId: string) => {
  if (!pdfId) {
    pdfFile.value = null;
    error.value = null;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
    }

    pdfFile.value = await loadPdf(pdfId);
  } catch (err) {
    error.value = 'Failed to load PDF';
    console.error('Error loading PDF:', err);
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.notebook?.id_pdf, async (newPdfId, oldPdfId) => {
  if (newPdfId !== oldPdfId) {
    await loadPdfFile(newPdfId || '');
  }
}, { immediate: false });

onMounted(async () => {
  await loadPdfFile(props.notebook?.id_pdf || '');

  document.addEventListener('mousemove', handlePdfMouseMove);
  document.addEventListener('mouseup', handlePdfMouseUp);
});

onUnmounted(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }

  document.removeEventListener('mousemove', handlePdfMouseMove);
  document.removeEventListener('mouseup', handlePdfMouseUp);
});

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
      <div v-else class="w-[45vw] h-[60vh] relative overflow-auto flex justify-center">
        <div class="pdf-wrapper relative" :class="{ 'post-it-cursor': isPostItMode }" @mousedown="handlePdfClick">
          <VuePdfEmbed ref="pdfTemplateRef" :width="pdfWidth" :height="pdfHeight" :source="pdfUrl"
            :page="currentPage ?? 1" :text-layer="true" @loaded="handleDocumentRender" />
          <div v-for="(highlight, index) in currentHighlights" :key="'highlight-' + index"
            class="absolute bg-yellow-300/40 border border-yellow-400/60 group cursor-pointer" :style="{
              left: `${highlight.left * scale / 100}px`,
              top: `${highlight.top * scale / 100}px`,
              width: `${highlight.width * scale / 100}px`,
              height: `${highlight.height * scale / 100}px`
            }" @click="deleteHighlight(index)">
            <div
              class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-xs px-1 rounded-bl">
              ✕
            </div>
          </div>
          <div v-if="dragBox && isPostItMode"
            class="absolute border-2 border-blue-500 bg-blue-100/30 pointer-events-none" :style="{
              left: `${dragBox.left * scale / 100}px`,
              top: `${dragBox.top * scale / 100}px`,
              width: `${dragBox.width * scale / 100}px`,
              height: `${dragBox.height * scale / 100}px`
            }"></div>
          <PostIt v-for="(postIt, index) in currentTextBoxes" :key="'postit-' + index" :content="postIt.content"
            :left="postIt.left" :top="postIt.top" :width="postIt.width" :height="postIt.height" :scale="scale"
            @update:content="updatePostItContent(index, $event)" @delete="deletePostIt(index)" />
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
        <img src="../assets/minus.svg" @click="scale = Math.max(10, scale - 25)"
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
        <div @click="toggleHighlightMode"
          class="flex items-center justify-center p-[0.25rem] rounded transition-all cursor-pointer">
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            class="h-[1rem] w-[1.063rem] transition-transform hover:scale-125">
            <path
              d="M9.84375 9.84375L14.7937 3.12188L13.8781 2.20625L7.15625 7.15625L9.84375 9.84375ZM4 10V7.75938C4 7.28125 4.225 6.83437 4.60938 6.55312L13.1438 0.2625C13.375 0.090625 13.6563 0 13.9438 0C14.3 0 14.6406 0.140625 14.8938 0.39375L16.6063 2.10625C16.8594 2.35938 17 2.7 17 3.05938C17 3.34688 16.9094 3.62812 16.7375 3.85938L10.45 12.3906C10.1687 12.775 9.71875 13 9.24375 13H7.00313L6.20937 13.7937C5.81875 14.1844 5.18437 14.1844 4.79375 13.7937L3.20937 12.2094C2.81875 11.8188 2.81875 11.1844 3.20937 10.7937L4 10ZM0.21875 14.5719L1.83438 12.9563L4.04063 15.1625L3.425 15.7781C3.28437 15.9187 3.09375 15.9969 2.89375 15.9969L0.75 16C0.334375 16 0 15.6656 0 15.25V15.1031C0 14.9031 0.078125 14.7125 0.21875 14.5719Z"
              :fill="isHighlightMode ? '#FBBF24' : '#FEFEFE'" class="transition-colors duration-300" />
          </svg>
        </div>
        <div @click="togglePostItMode"
          class="flex items-center justify-center p-[0.25rem] rounded transition-all cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
            class="h-[0.875rem] w-[0.875rem] transition-transform hover:scale-125">
            <path
              d="M2 14C0.896875 14 0 13.1031 0 12V2C0 0.896875 0.896875 0 2 0H12C13.1031 0 14 0.896875 14 2V8.67188C14 9.20312 13.7906 9.7125 13.4156 10.0875L10.0844 13.4156C9.70938 13.7906 9.2 14 8.66875 14H2ZM12.1719 8.5H9.25C8.83437 8.5 8.5 8.83437 8.5 9.25V12.1719L12.1719 8.5Z"
              :fill="isPostItMode ? '#52CBF7' : '#FEFEFE'" class="transition-colors duration-300" />
          </svg>
        </div>
        <div @click="pdfTemplateRef?.download(pdfFile?.name || 'download.pdf')"
          class="flex items-center justify-center p-[0.25rem] rounded transition-all">
          <img src="../assets/download.svg"
            class="h-[0.938rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
            alt="" />
        </div>
      </div>
    </div>
  </div>
</template>
