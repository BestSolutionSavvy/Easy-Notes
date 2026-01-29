<script setup lang="ts">
interface Props {
  icon: string;
  alt?: string;
  background?: string;
  isLoading?: boolean;
  onClick?: (e?: Event) => void;
}

const props = withDefaults(defineProps<Props>(), {
  background: 'bg-blue-950',
  isLoading: false
});

const handleClick = (event: Event) => {
  if (props.onClick && !props.isLoading) {
    props.onClick(event);
  }
};
</script>

<template>
  <div :class="[
    'w-8 h-8 p-2 rounded-lg inline-flex justify-center items-center gap-2 overflow-hidden transition-opacity',
    props.background,
    props.isLoading ? 'cursor-wait' : 'cursor-pointer hover:opacity-80'
  ]" @click="handleClick">
    <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
    <img v-else :src="icon" :alt="alt || ''" class="flex-1 self-stretch" />
  </div>
</template>
