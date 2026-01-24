<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import PdfPage from "../pages/PdfPage.vue";
import NotePage from "../pages/NotePage.vue";

interface Props {
  notebookId?: string;
  subject?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <AppHeader :variant="'tools'"/>
  <MainStructure>
    <template #left>
        <PdfPage />
    </template>
    <template #right>
        <NotePage />
    </template>
  </MainStructure>
</template>
