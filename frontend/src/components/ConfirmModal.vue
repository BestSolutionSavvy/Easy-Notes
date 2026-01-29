<script setup lang="ts">
import SimpleButton from "./SimpleButton.vue";

defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "delete";
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="emit('cancel')"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-fade-in"
      >
        <h2 class="text-2xl font-semibold text-zinc-700 mb-4">{{ title }}</h2>
        <p class="text-zinc-600 mb-6">{{ message }}</p>
        <div class="flex gap-3 justify-end">
          <SimpleButton
            :text="cancelText || 'Cancel'"
            variant="default"
            @click="emit('cancel')"
          ></SimpleButton>
          <SimpleButton
            :text="confirmText || 'Confirm'"
            :variant="variant || 'delete'"
            @click="emit('confirm')"
          ></SimpleButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
