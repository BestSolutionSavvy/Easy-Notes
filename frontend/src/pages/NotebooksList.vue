<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import axios from "axios";
import RoundIconButton from "../components/AddItemButton.vue";
import plusIcon from "../assets/plus.svg";
import wandIcon from "../assets/wand.svg";
import loadIcon from "../assets/load.svg";
import trashIcon from "../assets/trash.svg";
import ListElement from "../components/ListElement.vue";
import type { Notebook } from "../types/notebook";

const authStore = useAuthStore();
const notebooks = ref<Notebook[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const emit = defineEmits<{
  (e: "select-notebook", notebook: Notebook): void;
}>();

const router = useRouter();

const loadNotebooks = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await axios.get(`/api/notebooks/${authStore.user?.email}`);
    notebooks.value = Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      notebooks.value = [];
    } else {
      errorMessage.value =
        error.response?.data?.message || "Failed to load notebooks";
      console.error("Error loading notebooks:", error);
    }
  } finally {
    isLoading.value = false;
  }
};

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

const switchToHomePage = (subject: string, notebook?: Notebook) => {
  router.push({
    name: "Home",
    query: {
      subject,
      notebookId: notebook?._id,
    },
  });
};

const selectNotebook = (notebook: Notebook) => {
  if (notebook.pages && notebook.pages.length > 0) {
    emit("select-notebook", notebook);
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
    await axios.delete(
      `/api/notebooks/${authStore.user.email}/${notebook._id}`,
    );
    await axios.delete(`/api/pdfs/${notebook.id_pdf}`);
    notebooks.value = notebooks.value.filter((n) => n._id !== notebook._id);
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to delete notebook");
    console.error("Error deleting notebook:", error);
  }
};

const summarizeNotebook = async (notebook: Notebook) => {
  if (!notebook._id || !authStore.user?.email) return;
  try {
    const response = await axios.post(
      `/api/summarize/${notebook._id}`,
    );
    // Notify
    // TODO
    console.log(response.data.summary.choices[0].message.content);
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to summarize notebook");
    console.error("Error summarizing notebook:", error);
  }
};

onMounted(() => {
  loadNotebooks();
});
</script>

<template>
  <div
    class="h-full flex-1 w-full relative overflow-hidden shrink-0 flex flex-col items-start text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="self-stretch flex-1 rounded-tl-none rounded-tr-num-8 rounded-br-num-8 rounded-bl-none bg-white overflow-hidden flex flex-col items-center justify-center p-[0.625rem] gap-[1.875rem]">
      <div v-if="isLoading" class="flex flex-col items-center justify-center gap-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gainsboro-200 border-t-darkslateblue-100"></div>
        <div class="text-gray-500">Loading notebooks...</div>
      </div>
      <div v-else-if="errorMessage" class="text-red-500">
        {{ errorMessage }}
      </div>
      <div v-else-if="notebooks.length === 0"
        class="animate-fade-in flex flex-col items-center justify-center gap-4 p-8 max-w-md">
        <div class="text-6xl">📒</div>
        <div class="text-xl font-semibold text-gray-700">No notebooks yet</div>
        <div class="text-center text-gray-500 leading-relaxed">
          Create your first notebook by using the
          <router-link to="/" class="text-blue-500 hover:underline font-medium">home screen</router-link>
          or starting from a PDF of a
          <router-link to="/classes" class="text-blue-500 hover:underline font-medium">class</router-link>!
        </div>
      </div>

      <ul v-else>
        <li v-for="subject in subjects" :key="subject"
          class="w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
          <div class="animate-fade-in">
            <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
              <div class="relative font-semibold">{{ subject }}</div>
              <RoundIconButton :icon="plusIcon" :alt="`Add Notebook for ${subject}`"
                :onClick="() => switchToHomePage(subject)" />
            </div>
            <div
              class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]" />
          </div>
          <ul class="w-full flex flex-col gap-[0.625rem]">
            <ListElement v-for="(notebook, index) in notebooksPerSubject[subject]" :key="notebook.name"
              :title="notebook.name" :date="notebook.date" :index="index" @click="selectNotebook(notebook)" :buttons="[
                {
                  icon: wandIcon,
                  alt: 'AI Summary',
                  onClick: () => {
                    summarizeNotebook(notebook);
                  },
                },
                {
                  icon: loadIcon,
                  alt: 'Edit Notebook',
                  onClick: () => switchToHomePage(subject, notebook),
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
