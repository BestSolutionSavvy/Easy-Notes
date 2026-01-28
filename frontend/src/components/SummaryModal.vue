<script setup lang="ts">
import SimpleButton from "./SimpleButton.vue";

defineProps<{
  isOpen: boolean;
  notebookName: string;
  summaryContent: string;
}>();

const emit = defineEmits<{
  download: [];
  delete: [];
  close: [];
}>();
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-fade-in"
      >
        <h2 class="text-2xl font-semibold text-zinc-700 mb-4">
          Summary - {{ notebookName }}
        </h2>

        <div
          class="flex-1 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <pre class="whitespace-pre-wrap text-sm text-zinc-700 font-sans">{{
            summaryContent
          }}</pre>
        </div>

        <div class="flex gap-3 justify-between">
          <div class="flex gap-3">
            <SimpleButton
              text="Download"
              variant="default"
              @click="emit('download')"
            />
            <SimpleButton
              text="Delete"
              variant="delete"
              @click="emit('delete')"
            />
          </div>
          <SimpleButton text="Close" variant="default" @click="emit('close')" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
