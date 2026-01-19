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
  <img 
    :src="icon" 
    :alt="alt || ''" 
    @click="handleClick"
    class="h-[2rem] w-[2rem] rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
  />
</template>
