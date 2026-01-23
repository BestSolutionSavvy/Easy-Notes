<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
onMounted(async () => {
  await authStore.verifyToken();
});
</script>

<template>
  <div class="min-h-screen bg-whitesmoke-200 flex flex-col p-2.5 gap-2.5">
    <RouterView />
  </div>
</template>
