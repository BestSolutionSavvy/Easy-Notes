<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from "vue";
import type { Notebook } from "../types/notebook";
import { marked } from "marked";

const isEditing = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const noteContent = ref<string>("");

interface Props {
  notebook?: Notebook | null;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  notebook: null,
  currentPage: 0,
});

const currentPageData = computed(() => {
  if (props.notebook?.pages) {
    return props.notebook.pages.find(
      (p) => p.page_number === props.currentPage,
    );
  } else {
    return null;
  }
});

const renderedContent = computed(() => {
  if (noteContent.value) {
    return marked.parse(noteContent.value);
  } else {
    return "";
  }
});

watch(
  () => props.currentPage,
  () => {
    noteContent.value = currentPageData.value?.note_content || "";
  },
);

watch(noteContent, () => {
  if (isEditing.value) {
    saveNote();
  }
});

const saveNote = (pageNumber?: number) => {
  if (props.notebook && props.notebook.pages) {
    const targetPage =
      pageNumber !== undefined ? pageNumber : props.currentPage;
    const pageIndex = props.notebook.pages.findIndex(
      (p) => p.page_number === targetPage,
    );

    if (pageIndex !== -1) {
      const page = props.notebook.pages[pageIndex];
      if (page) {
        page.note_content = noteContent.value;
      }
    } else if (noteContent.value.trim()) {
      props.notebook.pages.push({
        page_number: targetPage,
        slide_number: targetPage,
        note_content: noteContent.value,
        text_boxes: [],
        highlights: [],
      });
    }
  }
};

const startEditing = () => {
  isEditing.value = true;
  nextTick(() => {
    textareaRef.value?.focus();
  });
};

const stopEditing = () => {
  isEditing.value = false;
};

defineExpose({
  startEditing,
  stopEditing,
});

onMounted(() => {
  noteContent.value = currentPageData.value?.note_content || "";
});
</script>

<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border gap-[0.625rem] text-center text-[1.25rem] text-darkslategray font-inter"
  >
    <div
      class="self-stretch overflow-hidden flex items-end py-[0rem] px-[0.625rem]"
    >
      <div
        class="overflow-hidden flex items-center justify-center gap-[0.312rem]"
      >
        <img
          src="../assets/notes.svg"
          class="w-[1rem] relative max-h-full"
          alt=""
        />
        <b class="relative">Notes for page {{ props.currentPage }}</b>
        <div
          class="h-[1.125rem] w-[0.313rem] relative overflow-hidden shrink-0"
        />
      </div>
    </div>
    <div
      class="self-stretch flex-1 flex flex-col items-start text-left text-[1.5rem] text-gray-500"
    >
      <div
        v-if="!isEditing"
        @click="startEditing"
        class="self-stretch flex-1 rounded-[10px] border-gainsboro-100 border-solid border-[1px] py-[0.937rem] px-[1.25rem] text-gray-500 text-[1rem] font-inter leading-normal cursor-pointer hover:bg-gray-50 transition-colors overflow-y-auto markdown-content"
        :class="{ 'text-gray-400 italic': !noteContent }"
      >
        <div v-if="noteContent" v-html="renderedContent"></div>
        <div v-else>Clicca per aggiungere note...</div>
      </div>
      <textarea
        v-else
        v-model="noteContent"
        @blur="saveNote()"
        class="self-stretch flex-1 rounded-[10px] border-gainsboro-100 border-solid border-[1px] py-[0.937rem] px-[1.25rem] resize-none focus:outline-none text-gray-500 text-[1rem] font-inter leading-normal"
        placeholder="Scrivi qui le tue note..."
        ref="textareaRef"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.markdown-content :deep(h1) {
  font-size: 2em;
  font-weight: 700;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  color: #1a1a1a;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 0.5em;
  margin-bottom: 0.4em;
  color: #1a1a1a;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 0.5em;
  margin-bottom: 0.3em;
  color: #2a2a2a;
}

.markdown-content :deep(h4) {
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 0.4em;
  margin-bottom: 0.3em;
  color: #2a2a2a;
}

.markdown-content :deep(p) {
  margin-bottom: 0.75em;
  line-height: 1.6;
}

.markdown-content :deep(strong) {
  font-weight: 700;
  color: #1a1a1a;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5em;
  margin-bottom: 0.75em;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5em;
  margin-bottom: 0.75em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25em;
  line-height: 1.6;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 0.9em;
  color: #d63384;
}

.markdown-content :deep(pre) {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 0.75em;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #1a1a1a;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #4766d4;
  padding-left: 1em;
  margin-left: 0;
  margin-bottom: 0.75em;
  color: #4a5568;
  font-style: italic;
}

.markdown-content :deep(a) {
  color: #4766d4;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #25356e;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 1em 0;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0.75em;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5em;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f3f4f6;
  font-weight: 600;
}
</style>
