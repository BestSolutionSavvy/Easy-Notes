<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import axios from "axios";
import wandIcon from "../assets/wand.svg";
import loadIcon from "../assets/load.svg";
import trashIcon from "../assets/trash.svg";
import ListElement from "../components/ListElement.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import SummaryModal from "../components/SummaryModal.vue";
import type { Notebook } from "../types/notebook";

const authStore = useAuthStore();
const notebooks = ref<Notebook[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Modal states
const showDeleteModal = ref(false);
const showErrorModal = ref(false);
const showSummaryModal = ref(false);
const modalMessage = ref("");
const modalTitle = ref("");
const notebookToDelete = ref<Notebook | null>(null);
const summaryContent = ref("");

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

const onLoadNotebook = (subject: string, notebook?: Notebook) => {
  router.push({
    name: "Home",
    query: {
      subject,
      notebookId: notebook?._id,
    },
  });
};

const onSelectNotebook = (notebook: Notebook) => {
  if (notebook.pages && notebook.pages.length > 0) {
    emit("select-notebook", notebook);
  } else {
    console.warn("Notebook has no pages:", notebook);
  }
};

const onDeleteNotebook = async (notebook: Notebook) => {
  if (!notebook._id || !authStore.user?.email) return;
  notebookToDelete.value = notebook;
  showDeleteModal.value = true;
};

const confirmDeleteNotebook = async () => {
  showDeleteModal.value = false;
  const notebook = notebookToDelete.value;
  if (!notebook?._id || !authStore.user?.email) return;

  try {
    await axios.delete(
      `/api/notebooks/${authStore.user.email}/${notebook._id}`,
    );
    await axios.delete(`/api/pdfs/${notebook.id_pdf}`);
    notebooks.value = notebooks.value.filter((n) => n._id !== notebook._id);
  } catch (error: any) {
    modalTitle.value = "Delete Error";
    modalMessage.value =
      error.response?.data?.message || "Failed to delete notebook";
    showErrorModal.value = true;
    console.error("Error deleting notebook:", error);
  } finally {
    notebookToDelete.value = null;
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  notebookToDelete.value = null;
};

const onSummarizeNotebook = async (notebook: Notebook) => {
  if (!notebook._id || !authStore.user?.email) return;
  try {
    const response = await axios.post(`/api/summarize/${notebook._id}`);
    summaryContent.value = response.data.summary.choices[0].message.content;
    modalTitle.value = `Summary: ${notebook.name}`;
    showSummaryModal.value = true;
  } catch (error: any) {
    modalTitle.value = "Summarize Error";
    modalMessage.value =
      error.response?.data?.message || "Failed to summarize notebook";
    showErrorModal.value = true;
    console.error("Error summarizing notebook:", error);
  }
};

const closeSummaryModal = () => {
  showSummaryModal.value = false;
  summaryContent.value = "";
};

const closeErrorModal = () => {
  showErrorModal.value = false;
  modalMessage.value = "";
  modalTitle.value = "";
};

onMounted(() => {
  loadNotebooks();
});
</script>

<template>
  <div
    class="h-full flex-1 w-full relative overflow-hidden shrink-0 flex flex-col items-start text-left text-[1rem] text-darkslateblue font-inter"
  >
    <div
      class="self-stretch flex-1 rounded-tl-none rounded-tr-num-8 rounded-br-num-8 rounded-bl-none bg-white overflow-hidden flex flex-col items-center justify-center p-[0.625rem] gap-[1.875rem]"
    >
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center gap-4"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-gainsboro-200 border-t-darkslateblue-100"
        ></div>
        <div class="text-gray-500">Loading notebooks...</div>
      </div>
      <div v-else-if="errorMessage" class="text-red-500">
        {{ errorMessage }}
      </div>
      <div
        v-else-if="notebooks.length === 0"
        class="animate-fade-in flex flex-col items-center justify-center gap-4 p-8 max-w-md"
      >
        <div class="text-6xl">📒</div>
        <div class="text-xl font-semibold text-gray-700">No notebooks yet</div>
        <div class="text-center text-gray-500 leading-relaxed">
          Create your first notebook by using the
          <router-link to="/" class="text-blue-500 hover:underline font-medium"
            >home screen</router-link
          >
          or starting from a PDF of a
          <router-link
            to="/classes"
            class="text-blue-500 hover:underline font-medium"
            >class</router-link
          >!
        </div>
      </div>

      <ul v-else>
        <li
          v-for="subject in subjects"
          :key="subject"
          class="w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]"
        >
          <div class="animate-fade-in">
            <div
              class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray"
            >
              <div class="relative font-semibold">{{ subject }}</div>
            </div>
            <div
              class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]"
            />
          </div>
          <ul class="w-full flex flex-col gap-[0.625rem]">
            <ListElement
              v-for="(notebook, index) in notebooksPerSubject[subject]"
              :key="notebook.name"
              :title="notebook.name"
              :date="notebook.date"
              :index="index"
              :gradient="'[background:linear-gradient(90deg,_#fff0ca,_#fff8e6_65.38%,_#fffcf5)]'"
              @click="onSelectNotebook(notebook)"
              :buttons="[
                {
                  icon: wandIcon,
                  alt: 'AI Summary',
                  background: 'bg-orangered-100',
                  onClick: () => {
                    onSummarizeNotebook(notebook);
                  },
                },
                {
                  icon: loadIcon,
                  alt: 'Edit Notebook',
                  background: 'bg-orangered-100',
                  onClick: () => onLoadNotebook(subject, notebook),
                },
                {
                  icon: trashIcon,
                  alt: 'Delete Note',
                  background: 'bg-orangered-100',
                  onClick: () => onDeleteNotebook(notebook),
                },
              ]"
            />
          </ul>
        </li>
      </ul>
    </div>
    <ConfirmModal
      :isOpen="showDeleteModal"
      title="Delete Notebook"
      :message="`Are you sure you want to delete &quot;${notebookToDelete?.name}&quot;? This action cannot be undone.`"
      confirmText="Delete"
      cancelText="Cancel"
      variant="delete"
      @confirm="confirmDeleteNotebook"
      @cancel="cancelDelete"
    />
    <ConfirmModal
      :isOpen="showErrorModal"
      :title="modalTitle"
      :message="modalMessage"
      confirmText="OK"
      variant="default"
      @confirm="closeErrorModal"
      @cancel="closeErrorModal"
    />
    <SummaryModal
      :isOpen="showSummaryModal"
      :title="modalTitle"
      :content="summaryContent"
      @close="closeSummaryModal"
    />
  </div>
</template>
