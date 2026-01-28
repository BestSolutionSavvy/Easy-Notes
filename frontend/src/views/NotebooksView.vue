<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import NotebooksList from "../pages/NotebooksList.vue";
import PdfPreviewPage from "../pages/PdfPreviewPage.vue";
import type { Notebook } from "../types/notebook";
import { useAuthStore } from "../stores/auth";

const props = defineProps<{
  summaryId?: string;
}>();

const authStore = useAuthStore();

const selectedNotebook = ref<Notebook | undefined>(undefined);
const handleSelectNotebook = (notebook: Notebook) => {
  selectedNotebook.value = notebook;
};
</script>

<template>
  <AppHeader :username="authStore.user?.email"/>
  <MainStructure>
    <template #left>
      <NotebooksList :summaryId="summaryId" @select-notebook="handleSelectNotebook" />
    </template>
    <template #right>
      <PdfPreviewPage :notebook="selectedNotebook" />
    </template>
  </MainStructure>
</template>
