<script setup lang="ts">
import { ref } from 'vue';

const spinCount = ref(0);

const handleLogoClick = () => {
  spinCount.value++;
};
</script>

<template>
  <div
    class="animate-fade-in h-full flex-1 w-full relative rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-[10px] bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border text-left text-[3rem] text-darkslategray font-inter"
  >
    <div
      class="w-[35rem] h-[31.625rem] overflow-hidden shrink-0 flex flex-col items-center justify-center gap-[0.187rem]"
    >
      <div
        class="self-stretch overflow-hidden flex items-center justify-center gap-[0.937rem]"
      >
        <img 
          src="../assets/logo.png" 
          class="w-[3.75rem] relative max-h-full object-cover cursor-pointer hover:scale-110" 
          :style="{ transform: `rotateY(${spinCount * 360}deg)`, transition: 'transform 0.6s ease-in-out' }"
          @click="handleLogoClick"
          alt="" 
        />
        <div class="relative font-semibold">Easy Notes</div>
      </div>
      <div
        class="self-stretch overflow-hidden flex items-center justify-center text-[1.875rem] text-gray-300"
      >
        <div class="relative font-semibold">Note taking made easy</div>
      </div>
    </div>
  </div>
</template>
