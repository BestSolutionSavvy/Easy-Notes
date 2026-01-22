<script setup lang="ts">
import { onMounted } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from "./components/AppHeader.vue";
import MainStructure from "./components/MainStructure.vue";
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
onMounted(async () => {
  await authStore.verifyToken();
});

const route = useRoute();
const headerVariant = computed(() => route.path === '/' ? 'tools' : 'default');
</script>

<template>
  <div class="min-h-screen bg-whitesmoke-200 flex flex-col p-2.5 gap-2.5">
    <AppHeader :variant="headerVariant" />
    <MainStructure>
      <template #left>
        <RouterView name="left" />
      </template>
      <template #right>
        <RouterView name="right" />
      </template>
    </MainStructure>
  </div>
</template>
