<script setup lang="ts">
//import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import PdfPage from "../pages/PdfPage.vue";
import NotePage from "../pages/NotePage.vue";
import { ref } from "vue";
import type { Notebook } from "../types/notebook";

interface Props {
    notebookName?: string;
    pdfName?: string;
    subject?: string;
}

const props = defineProps<Props>();

const openedNotebook = ref<Notebook | null>(null);
const currentPage = ref<number>(0);

const handleOpenNotebook = (notebook: Notebook) => {
    openedNotebook.value = notebook;
    const pageIndex = notebook.last_page || 0;
    currentPage.value = Math.min(pageIndex, (notebook.pages?.length || 1) - 1);
};

const createNotebook = () => {
    // TODO
}

</script>

<template>
    <AppHeader @open-notebook="handleOpenNotebook" :variant="'tools'" />
    <MainStructure>
        <template #left>
            <PdfPage :notebook="openedNotebook" :currentPage="currentPage" />
        </template>
        <template #right>
            <NotePage :notebook="openedNotebook" :currentPage="currentPage" />
        </template>
    </MainStructure>
</template>
