<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
onMounted(async () => {
  await authStore.verifyToken();
});
</script>

<template>
  <div class="h-screen bg-whitesmoke-200 flex flex-col p-2.5 gap-2.5 overflow-hidden">
    <RouterView />
  </div>
</template>
