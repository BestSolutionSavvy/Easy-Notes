<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ListElement from "../components/ListElement.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import plusIcon from "../assets/plus.svg";
import trashIcon from "../assets/trash.svg";
import loadIcon from "../assets/load.svg";
import AddItemButton from "../components/AddItemButton.vue";
import { useAuthStore } from "../stores/auth";
import type { Class } from "../types/class";
import type { PDFDocument } from "../types/pdf";

const props = defineProps<{
  role?: string;
  classItem?: Class;
}>();

const authStore = useAuthStore();
const router = useRouter();
const lectures = ref<PDFDocument[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const showDeleteModal = ref(false);
const lectureToDelete = ref<PDFDocument | null>(null);

const fetchLectures = async () => {
  if (!props.classItem?.pdfs || props.classItem.pdfs.length === 0) {
    lectures.value = [];
    return;
  }

  try {
    const pdfPromises = props.classItem.pdfs.map((pdfId) =>
      axios.get(`/api/pdfs/${pdfId}`),
    );
    const responses = await Promise.all(pdfPromises);
    lectures.value = responses.map((res) => res.data)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching lectures:", error);
    lectures.value = [];
  }
};

const handleDelete = (lectureId: string) => {
  const lecture = lectures.value.find((l) => l._id === lectureId);
  if (!lecture) return;
  
  lectureToDelete.value = lecture;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  showDeleteModal.value = false;
  if (!props.classItem?._id || !lectureToDelete.value?._id) return;

  try {
    const updatedPdfs = (props.classItem.pdfs || []).filter(
      (id) => id !== lectureToDelete.value!._id,
    );
    await axios.put(`/api/classes/${props.classItem._id}`, {
      pdfs: updatedPdfs,
    });
    await axios.delete(`/api/pdfs/${lectureToDelete.value._id}`);
    lectures.value = lectures.value.filter((l) => l._id !== lectureToDelete.value!._id);
    lectureToDelete.value = null;
  } catch (error) {
    console.error("Error deleting lecture:", error);
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  lectureToDelete.value = null;
};

const handleLoad = (lectureId: string) => {
  const lecture = lectures.value.find((l) => l._id === lectureId);

  if (!lecture || !props.classItem) {
    console.error("Lecture or class not found");
    return;
  }

  router.push({
    name: "Home",
    query: {
      pdfId: lecture._id,
      subject: props.classItem.name,
    },
  });
};

const handleAddLecture = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !props.classItem?._id || !authStore.user?.email) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("name", file.name.replace(".pdf", "") + " lecture");
    formData.append("type", "class");
    formData.append("owner", authStore.user.email);

    const response = await axios.post("/api/pdfs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const uploadedPdfId = response.data._id;

    // Add PDF ID to class's pdfs array
    const updatedPdfs = [...(props.classItem.pdfs || []), uploadedPdfId];
    await axios.put(`/api/classes/${props.classItem._id}`, {
      pdfs: updatedPdfs,
    });

    // Fetch all lectures including the new one using the updated array
    const pdfPromises = updatedPdfs.map((pdfId) =>
      axios.get(`/api/pdfs/${pdfId}`),
    );
    const responses = await Promise.all(pdfPromises);
    lectures.value = responses
      .map((res) => res.data)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Reset file input
    if (target) target.value = "";
  } catch (error) {
    console.error("Error uploading PDF:", error);
  }
};

watch(
  () => props.classItem,
  () => {
    fetchLectures();
  },
  { immediate: true },
);
</script>
<template>
  <div
    class="h-full flex-1 w-full relative bg-white shrink-0 text-left text-[1rem] text-darkslateblue font-inter flex items-center justify-center"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf"
      style="display: none"
      @change="handleFileSelect"
    />
    <div
      class="w-[31.25rem] max-h-[90%] overflow-y-auto overflow-x-hidden p-[0.312rem] scrollbar-hidden"
    >
      <div class="flex flex-col items-center gap-[0.625rem]">
      <div
        v-if="!classItem"
        class="animate-fade-in flex flex-col items-center justify-center gap-4 p-8 max-w-md"
      >
        <div class="text-6xl">📚</div>
        <div class="text-xl font-semibold text-gray-700">No class selected</div>
        <div class="text-center text-gray-500 leading-relaxed">
          Select a class from the list to view and manage its lectures
        </div>
      </div>
      <div v-else class="animate-fade-in">
        <div
          class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray"
        >
          <div class="relative font-semibold">
            {{ props.classItem?.name }}
          </div>
          <AddItemButton
            v-if="props.role === 'teacher' && props.classItem"
            :icon="plusIcon"
            :background="'bg-gradient-to-r from-pink-400 to-pink-600'"
            alt="Add Lecture"
            :onClick="handleAddLecture"
          />
        </div>
        <div
          class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]"
        />
      </div>
      <ListElement
        v-for="(lecture, index) in lectures"
        :key="lecture._id"
        :title="lecture.name"
        :date="classItem?.date || ''"
        :index="index"
        :gradient="'[background:linear-gradient(90deg,_#ffcee9,_#ffe5f3_65.38%,_#fff3f9)]'"
        :buttons="
          props.role === 'teacher'
            ? [
                {
                  icon: trashIcon,
                  alt: 'Delete',
                  background: 'bg-pink-600',
                  onClick: () => handleDelete(lecture._id),
                },
              ]
            : [
                {
                  icon: loadIcon,
                  alt: 'Load',
                  background: 'bg-pink-600',
                  onClick: () => handleLoad(lecture._id),
                },
              ]
        "
      />
      </div>
    </div>
    <ConfirmModal
      :isOpen="showDeleteModal"
      title="Delete Lecture"
      :message="`Are you sure you want to delete &quot;${lectureToDelete?.name}&quot;? This action cannot be undone.`"
      confirmText="Delete"
      cancelText="Cancel"
      variant="delete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
