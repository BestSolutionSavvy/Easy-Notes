<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import PdfPage from "../pages/PdfPage.vue";
import NotePage from "../pages/NotePage.vue";
import { onMounted, ref } from "vue";
import type { Notebook} from "../types/notebook";

const openedNotebook = ref<Notebook | null>(null);
const currentPage = ref<number>(0);

const handleOpenNotebook = (notebook: Notebook) => {
    openedNotebook.value = notebook;
    const pageIndex = notebook.last_page || 0;
    currentPage.value = Math.min(pageIndex, (notebook.pages?.length || 1) - 1);
};

const handlePageNext = () => {
    if (openedNotebook.value && openedNotebook.value.pages) {
        const maxPage = openedNotebook.value.pages.length - 1;
        if (currentPage.value < maxPage) {
            currentPage.value++;
        }
    }
};

const handlePagePrev = () => {
    if (currentPage.value > 0) {
        currentPage.value--;
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
            <PdfPage :notebook="openedNotebook" :currentPage="currentPage" @page-next="handlePageNext" @page-prev="handlePagePrev" />
        </template>
        <template #right>
            <NotePage :notebook="openedNotebook" :currentPage="currentPage" />
        </template>
    </MainStructure>
</template>
