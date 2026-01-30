<script setup lang="ts">
interface Props {
  content: string;
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:content", value: string): void;
  (e: "delete"): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:content", target.value);
};
</script>

<template>
  <div
    class="absolute flex flex-col bg-yellow-200/60 border border-yellow-400 rounded-lg z-10 p-2"
    :style="{
      left: `${(left * scale) / 100}px`,
      top: `${(top * scale) / 100}px`,
      width: `${(width * scale) / 100}px`,
      height: `${(height * scale) / 100}px`,
    }"
  >
    <button
      @click="$emit('delete')"
      class="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-yellow-800 text-xs font-bold cursor-pointer hover:text-red-600 transition-colors"
    >
      x
    </button>
    <textarea
      :value="content"
      @input="handleInput"
      class="flex-1 bg-transparent border-none p-0 pt-4 resize-none outline-none font-sans text-xs text-gray-800 placeholder-gray-500"
      placeholder="Testo..."
    ></textarea>
  </div>
</template>
