<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import ClassesPage from "../pages/ClassesPage.vue";
import LecturesPage from "../pages/LecturesPage.vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const selectedClass = ref<any | undefined>(undefined);
const handleSelectClass = (classItem: any) => {
  selectedClass.value = classItem;
};

const role = authStore.user?.role;
</script>

<template>
  <AppHeader :username="authStore.user?.email" />
  <MainStructure>
    <template #left>
      <ClassesPage :role="role" @select-class="handleSelectClass" />
    </template>
    <template #right>
      <LecturesPage :role="role" :class-item="selectedClass" />
    </template>
  </MainStructure>
</template>
