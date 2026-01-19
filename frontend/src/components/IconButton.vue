<script setup lang="ts">
interface Props {
  icon: string;
  alt?: string;
  onClick?: () => void;
}

const props = defineProps<Props>();

const handleClick = () => {
  if (props.onClick) {
    props.onClick();
  }
};
</script>

<template>
  <div
    class="w-8 h-8 p-2 bg-blue-950 rounded-lg inline-flex justify-center items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
  >
    <img
      :src="icon"
      :alt="alt || ''"
      @click="handleClick"
      class="flex-1 self-stretch"
    />
  </div>
</template>
