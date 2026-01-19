<script setup lang="ts">
interface Props {
  icon: string;
  alt?: string;
  onClick: () => void;
}

const props = defineProps<Props>();

const handleClick = () => {
  props.onClick();
};
</script>

<template>
  <div
    @click="handleClick"
    class="w-6 h-6 bg-gradient-to-r from-indigo-700 to-blue-950 rounded-[32px] inline-flex 
      justify-center items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity
      ease-in-out hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
  >
    <div class="flex justify-center items-center">
      <img class="w-3 h-3" :alt="props.alt || ''" :src="props.icon" />
    </div>
  </div>
</template>
