<script setup lang="ts">
import IconButton from './IconButton.vue';

export interface ButtonConfig {
  icon: string;
  alt?: string;
  onClick?: () => void;
}

interface Props {
  title: string;
  date: string;
  index: number;
  buttons?: ButtonConfig[];
}

const props = defineProps<Props>();
</script>

<template>
  	<li class="
          animate-slide-in
          w-full 
          relative shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] 
          rounded-[10px] 
          [background:linear-gradient(90deg,_#ced8ff,_#e5ebff_65.38%,_#f5f7ff)] 
          overflow-hidden flex items-center justify-between py-[0.625rem] px-[1.125rem] 
          gap-[1.25rem] text-left text-[1rem] text-darkslateblue font-inter ease-in-out 
          ease-in-out hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          :style="{ animationDelay: `${props.index * 0.2}s` }">
    		<div class="relative leading-[100%] font-medium">{{ title }}</div>
    		<div class="relative text-[0.813rem] leading-[100%] font-medium">{{ date }}</div>
    		<div v-if="buttons && buttons.length > 0" class="overflow-hidden flex items-center gap-[0.625rem]">
      			<IconButton 
            v-for="(button, index) in buttons" 
            :key="index"
            :icon="button.icon"
            :alt="button.alt"
            :onClick="button.onClick"
          />
    		</div>
      </li>
</template>