<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import PdfPage from "../pages/PdfPage.vue";
import NotePage from "../pages/NotePage.vue";
import { onMounted, ref } from "vue";
import type { Notebook} from "../types/notebook";

const openedNotebook = ref<Notebook | null>(null);
const currentNotebookPage = ref<number>(0);
const currentPdfPage = ref<number>(0);

const handleOpenNotebook = (notebook: Notebook) => {
    openedNotebook.value = notebook;
    const pageIndex = notebook.last_page || 0;
    currentNotebookPage.value = Math.min(pageIndex, (notebook.num_pages || 1) - 1);
    currentPdfPage.value = notebook.pages.find(p => p.page_number === currentNotebookPage.value)?.slide_number || 0;
};

const handlePageNext = () => {
    if (openedNotebook.value && openedNotebook.value.pages) {
        const maxPage = openedNotebook.value.num_pages - 1;
        if (currentNotebookPage.value < maxPage) {
            currentNotebookPage.value++;
            const page = openedNotebook.value.pages.find(p => p.page_number === currentNotebookPage.value);
            if (page) {
                currentPdfPage.value = page.slide_number;
            } else {
                currentPdfPage.value = currentPdfPage.value + 1;
            }
        }
    }
};

const handlePagePrev = () => {
    if (currentNotebookPage.value > 1) {
        currentNotebookPage.value--;
        if (openedNotebook.value && openedNotebook.value.pages) {
            const page = openedNotebook.value.pages.find(p => p.page_number === currentNotebookPage.value);
            if (page) {
                currentPdfPage.value = page.slide_number;
            } else {
                currentPdfPage.value = Math.max(1, currentPdfPage.value - 1);
            }
        }
    }
};

interface Props {
  notebookId?: string;
  subject?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <AppHeader @open-notebook="handleOpenNotebook" :variant="'tools'" />
    <MainStructure>
        <template #left>
            <PdfPage :notebook="openedNotebook" :currentPage="currentPdfPage" @page-next="handlePageNext" @page-prev="handlePagePrev" />
        </template>
        <template #right>
            <NotePage :notebook="openedNotebook" :currentPage="currentNotebookPage" />
        </template>
    </MainStructure>
</template>
