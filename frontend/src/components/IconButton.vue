<script setup lang="ts">
interface Props {
  icon: string;
  alt?: string;
  background?: string;
  onClick?: (e?: Event) => void;
}

const props = withDefaults(defineProps<Props>(), {
  background: 'bg-blue-950'
});

const handleClick = (event: Event) => {
  if (props.onClick) {
    props.onClick(event);
  }
};
</script>

<template>
  <div
    :class="[
      'w-8 h-8 p-2 rounded-lg inline-flex justify-center items-center gap-2 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity',
      props.background
    ]"
    @click="handleClick"
  >
    <img :src="icon" :alt="alt || ''" class="flex-1 self-stretch" />
  </div>
</template>
