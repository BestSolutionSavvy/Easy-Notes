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

defineOptions({ inheritAttrs: false })

const authStore = useAuthStore();

const route = useRoute();

const openedNotebook = ref<Notebook | null>(null);
const currentNotebookPage = ref<number>(0);
const currentPdfPage = ref<number>(0);

const handleOpenNotebook = (notebook: Notebook) => {
    handleCloseNotebook();
    openedNotebook.value = notebook;
    const pageIndex = notebook.last_page || 1;
    currentNotebookPage.value = pageIndex;
    currentPdfPage.value = notebook.pages.find(p => p.page_number === currentNotebookPage.value)?.slide_number || 1;
};

const handleCloseNotebook = () => {
    openedNotebook.value = null;
    currentNotebookPage.value = 0;
    currentPdfPage.value = 0;
};

const handlePageNext = () => {
    if (openedNotebook.value && openedNotebook.value.pages) {
        const maxPage = openedNotebook.value.num_notebook_pages;
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

const isTyping = (): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const isEditable = activeElement.getAttribute('contenteditable') === 'true';
    
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        isEditable
    );
};

const handleKeydown = (event: KeyboardEvent) => {
    if (isTyping() && !event.ctrlKey && !event.metaKey && !event.altKey) {
        return;
    }
    
    if (!isTyping()) {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            handlePageNext();
            return;
        }
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            handlePagePrev();
            return;
        }
    }
};

onMounted(() => {
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
                id_pdf: pdfId,
                type: "slide",
                date: new Date().toISOString(),
                num_notebook_pages: 100,
                pages: [],
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
            id_pdf: "",
            type: "simple",
            date: new Date().toISOString(),
            num_notebook_pages: 100,
            pages: [],
            last_page: 1
        };
        handleOpenNotebook(newNotebook);
    }
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
    <AppHeader @open-notebook="handleOpenNotebook" @close-notebook="handleCloseNotebook" :variant="'tools'"
        :currentNotebook="openedNotebook" :currentNotebookPage="currentNotebookPage" />
    <MainStructure>
        <template #left>
            <PdfPage v-if="openedNotebook?.type === 'slide'" :notebook="openedNotebook" :currentPage="currentPdfPage"
                @page-next="handlePageNext" @page-prev="handlePagePrev" />
            <NotePage v-else-if="openedNotebook?.type === 'simple'" :notebook="openedNotebook"
                :currentPage="currentNotebookPage" />
            <div v-else
                class="h-full flex-1 w-full rounded-tl-[10px] rounded-bl-[10px] flex flex-col items-center justify-center gap-4 p-8">
                <img src="../assets/pdf.svg" class="w-24 h-24 opacity-30" alt="" />
                <h2 class="text-2xl font-bold text-gray-400">No PDF opened</h2>
                <p class="text-gray-500 text-center max-w-md">Open a notebook with PDF from the header options to view
                    slides</p>
            </div>
        </template>
        <template #right>
            <NotePage v-if="openedNotebook?.type === 'slide'" :notebook="openedNotebook"
                :currentPage="currentNotebookPage" />
            <NotePage v-else-if="openedNotebook?.type === 'simple'" :notebook="openedNotebook"
                :currentPage="currentNotebookPage + 1" />
            <div v-else
                class="h-full flex-1 w-full rounded-tr-[10px] rounded-br-[10px] flex flex-col items-center justify-center gap-4 p-8">
                <img src="../assets/notes.svg" class="w-24 h-24 opacity-30" alt="" />
                <h2 class="text-2xl font-bold text-gray-400">No notebook opened</h2>
                <p class="text-gray-500 text-center max-w-md">Create a new notebook or open an existing one to start
                    taking notes</p>
            </div>
        </template>
    </MainStructure>
</template>
