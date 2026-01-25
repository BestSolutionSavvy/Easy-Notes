<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import PdfPage from "../pages/PdfPage.vue";
import NotePage from "../pages/NotePage.vue";
import { onMounted, onUnmounted, ref } from "vue";
import type { Notebook } from "../types/notebook";
import { useRoute } from "vue-router";
import axios from "axios";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const route = useRoute();

const openedNotebook = ref<Notebook | null>(null);
const currentNotebookPage = ref<number>(0);
const currentPdfPage = ref<number>(0);

const handleOpenNotebook = (notebook: Notebook) => {
    openedNotebook.value = notebook;
    const pageIndex = notebook.last_page || 1;
    currentNotebookPage.value = Math.min(pageIndex, (notebook.num_pages || 1) - 1);
    currentPdfPage.value = notebook.pages.find(p => p.page_number === currentNotebookPage.value)?.slide_number || 1;
};

const handlePageNext = () => {
    if (openedNotebook.value && openedNotebook.value.pages) {
        const maxPage = openedNotebook.value.num_pages;
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

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
        handlePageNext();
    } else if (event.key === "ArrowLeft") {
        handlePagePrev();
    }
};

onMounted(() => {
    // se ci sono delle cose nella query string, apri il notebook specificato
    const notebookId = route.query.notebookId as string | undefined;
    const subject = route.query.subject as string | undefined;
    const pdfId = route.query.pdfId as string | undefined;

    if (notebookId) {
        axios.get(`/api/notebooks/id/${notebookId}`).then(response => {
            handleOpenNotebook(response.data);
        });
    } else if (subject && pdfId) {
        axios.get(`/api/pdfs/${pdfId}`).then(res => {
            const pdfData = res.data;
            const newNotebook = {
                _id: "",
                name: pdfData.name + " notes",
                subject: subject,
                owner: authStore.user?.email || "unknown",
                type: "slide",
                date: new Date().toISOString(),
                num_pages: 100,
                pages: [{
                    id_pdf: pdfId,
                    page_number: 1,
                    slide_number: 1,
                    note_content: "",
                    text_boxes: [],
                    highlights: []
                }],
                last_page: 1
            };
            handleOpenNotebook(newNotebook);
        });
    }
    else if (subject) {
        const newNotebook = {
            _id: "",
            name: subject + " notes",
            subject: subject,
            owner: authStore.user?.email || "unknown",
            type: "simple",
            date: new Date().toISOString(),
            num_pages: 100,
            pages: [],
            last_page: 1
        };
        handleOpenNotebook(newNotebook);
    }
    // Aggiungi event listener per le frecce
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    // Rimuovi event listener quando il componente viene distrutto
    window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
    <AppHeader @open-notebook="handleOpenNotebook" :variant="'tools'" :currentNotebook="openedNotebook" :currentNotebookPage="currentNotebookPage" />
    <MainStructure>
        <template #left>
            <PdfPage v-if="openedNotebook?.type === 'slide'" :notebook="openedNotebook" :currentPage="currentPdfPage"
                @page-next="handlePageNext" @page-prev="handlePagePrev" />
            <NotePage v-else-if="openedNotebook?.type === 'simple'" :notebook="openedNotebook"
                :currentPage="currentNotebookPage" />
        </template>
        <template #right>
            <NotePage v-if="openedNotebook?.type === 'slide'" :notebook="openedNotebook"
                :currentPage="currentNotebookPage" />
            <NotePage v-else-if="openedNotebook?.type === 'simple'" :notebook="openedNotebook"
                :currentPage="currentNotebookPage + 1" />
        </template>
    </MainStructure>
</template>
