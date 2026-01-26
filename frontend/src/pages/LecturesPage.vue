<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ListElement from "../components/ListElement.vue";
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
    lectures.value = responses.map((res) => res.data);
  } catch (error) {
    console.error("Error fetching lectures:", error);
    lectures.value = [];
  }
};

const handleDelete = async (lectureId: string) => {
  if (!props.classItem?._id) return;

  try {
    // Delete the PDF document
    await axios.delete(`/api/pdfs/${lectureId}`);

    // Remove PDF ID from class's pdfs array
    const updatedPdfs = (props.classItem.pdfs || []).filter(
      (id) => id !== lectureId,
    );
    await axios.put(`/api/classes/${props.classItem._id}`, {
      pdfs: updatedPdfs,
    });

    // Refresh lectures
    await fetchLectures();
  } catch (error) {
    console.error("Error deleting lecture:", error);
  }
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

    // Refresh lectures
    await fetchLectures();

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
    class="h-full flex-1 w-full relative bg-white overflow-hidden shrink-0 text-left text-[1rem] text-darkslateblue font-inter"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf"
      style="display: none"
      @change="handleFileSelect"
    />
    <div
      class="absolute top-[calc(50%_-_147px)] left-[calc(50%_-_250px)] w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]"
    >
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
        :buttons="
          props.role === 'teacher'
            ? [
                {
                  icon: trashIcon,
                  alt: 'Delete',
                  onClick: () => handleDelete(lecture._id),
                },
              ]
            : [
                {
                  icon: loadIcon,
                  alt: 'Load',
                  onClick: () => handleLoad(lecture._id),
                },
              ]
        "
      />
    </div>
  </div>
</template>
