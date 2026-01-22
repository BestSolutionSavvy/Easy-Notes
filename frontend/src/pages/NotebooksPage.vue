<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { usePdfStore } from "../stores/pdf-load";
import axios from "axios";
import { formatDate } from "../lib/dateFormatter";
import RoundIconButton from "../components/AddItemButton.vue";
import plusIcon from "../assets/plus.svg";
import wandIcon from "../assets/wand.svg";
import loadIcon from "../assets/load.svg";
import trashIcon from "../assets/trash.svg";
import ListElement from "../components/ListElement.vue";
import type { Notebook } from "../types/notebook";

const authStore = useAuthStore();
const pdfStore = usePdfStore();
const notebooks = ref<Notebook[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const loadNotebooks = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await axios.get(`/api/notebooks`);
    notebooks.value = response.data.filter(
      (notebook: Notebook) => notebook.owner === authStore.user?.email
    );
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Failed to load notebooks";
    console.error("Error loading notebooks:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  pdfStore.clearSelectedPdf();
  loadNotebooks();
});

const subjects = computed(() => {
  const uniqueSubjects = new Set<string>();
  notebooks.value.forEach((notebook) => {
    uniqueSubjects.add(notebook.subject);
  });
  return Array.from(uniqueSubjects);
});

const notebooksPerSubject = computed(() => {
  const map: Record<string, Notebook[]> = {};
  subjects.value.forEach((subject) => {
    map[subject] = notebooks.value
      .filter((notebook) => notebook.subject === subject)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  return map;
});

const selectNotebook = (notebook: Notebook) => {
  if (notebook.pages && notebook.pages.length > 0) {
    const pdfId = notebook.pages[0]?.id_pdf;
    if (pdfId) {
      pdfStore.setSelectedPdf(pdfId, notebook.last_page);
    } else {
      console.warn("No id_pdf found in notebook pages");
    }
  } else {
    console.warn("Notebook has no pages:", notebook);
  }
};

const deleteNotebook = async (notebook: Notebook) => {
  if (!notebook._id || !authStore.user?.email) return;
  if (!confirm(`Are you sure you want to delete "${notebook.name}"?`)) {
    return;
  }
  try {
    await axios.delete(`/api/notebooks/${authStore.user.email}/${notebook._id}`);
    notebooks.value = notebooks.value.filter(n => n._id !== notebook._id);
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to delete notebook");
    console.error("Error deleting notebook:", error);
  }
};
</script>

<template>
  <div
    class="h-full flex-1 w-full relative overflow-hidden shrink-0 flex flex-col items-start text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="self-stretch flex-1 rounded-tl-none rounded-tr-num-8 rounded-br-num-8 rounded-bl-none bg-white overflow-hidden flex flex-col items-center justify-center p-[0.625rem] gap-[1.875rem]">
      
      <div v-if="isLoading" class="text-gray-500">Loading notebooks...</div>
      <div v-else-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
      <div v-else-if="notebooks.length === 0" class="text-gray-400">No notebooks found. Create your first one!</div>
      
      <ul v-else>
        <li v-for="subject in subjects" :key="subject"
          class="w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
          <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
            <div class="relative font-semibold">{{ subject }}</div>
            <RoundIconButton :icon="plusIcon" alt="Add Note" :onClick="() => {
                // TODO: Add Note action
              }
              " />
          </div>
          <div
            class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]" />
          <ul class="w-full flex flex-col gap-[0.625rem]">
            <ListElement v-for="(notebook, index) in notebooksPerSubject[subject]" :key="notebook.name"
              :title="notebook.name" :date="formatDate(notebook.date)" :index="index" 
              @click="selectNotebook(notebook)"
              :buttons="[
                {
                  icon: wandIcon,
                  alt: 'AI Summary',
                  onClick: () => {
                    // TODO: AI Summary action
                  },
                },
                {
                  icon: loadIcon,
                  alt: 'Edit Note',
                  onClick: () => selectNotebook(notebook),
                },
                {
                  icon: trashIcon,
                  alt: 'Delete Note',
                  onClick: () => deleteNotebook(notebook),
                },
              ]" />
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
