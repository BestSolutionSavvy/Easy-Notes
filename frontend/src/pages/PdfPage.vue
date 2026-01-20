<script setup lang="ts">
interface Props {
  id: string;
  toolBar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  toolBar: true,
});
</script>

<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-[10px] rounded-tr-none rounded-br-none rounded-bl-[10px] bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border gap-[0.625rem] text-center text-[1.25rem] text-darkslategray font-inter"
  >
    <div
      class="self-stretch overflow-hidden flex items-end py-[0rem] px-[0.625rem]"
    >
      <div
        class="overflow-hidden flex items-center justify-center gap-[0.312rem]"
      >
        <img
          src="../assets/pdf.svg"
          class="w-[1.25rem] relative max-h-full"
          alt=""
        />
        <b class="relative">Lorem_Ipsum.pdf</b>
        <div
          class="h-[1.125rem] w-[0.313rem] relative overflow-hidden shrink-0"
        />
        <div
          class="rounded-[5px] [background:linear-gradient(90deg,_#25356e,_#4766d4)] overflow-hidden flex items-center justify-center py-[0.187rem] px-[0.312rem] text-[0.875rem] text-gray-100"
        >
          <div class="relative font-medium">100 pages</div>
        </div>
      </div>
    </div>
    <div
      class="self-stretch flex-1 overflow-hidden flex flex-col items-start gap-[0.312rem] text-[0.875rem]"
    >
      <img
        src="../assets/slide-placeholder.png"
        class="self-stretch relative rounded-[10px] max-w-full overflow-hidden max-h-full object-cover"
        alt=""
      />
      <div
        class="self-stretch overflow-hidden flex items-center justify-end py-[0rem] px-[0.687rem]"
      >
        <div class="relative font-medium">1/100</div>
      </div>
    </div>
    <div
      class="self-stretch h-[2.313rem] overflow-hidden shrink-0 flex items-start justify-end p-[0.625rem] box-border"
    />
    <div
      v-if="props.toolBar"
      class="rounded-[10px] [background:linear-gradient(90deg,_#1b264f,_#3e57b5)] overflow-hidden flex items-center py-[0rem] px-[0.625rem] text-[0.75rem] text-gray-700"
    >
      <div
        class="overflow-hidden flex items-center justify-center p-[0.625rem] gap-[0.437rem]"
      >
        <img
          src="../assets/back.svg"
          class="h-[0.875rem] w-[0.5rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md"
        >
          <div class="relative">1/100</div>
        </div>
        <img
          src="../assets/next.svg"
          class="h-[0.875rem] w-[0.5rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
      </div>
      <div
        class="overflow-hidden flex items-center justify-center p-[0.625rem] gap-[0.437rem]"
      >
        <img
          src="../assets/minus.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <div
          class="rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] cursor-pointer transition-all hover:bg-gray-200 hover:shadow-md"
        >
          <div class="relative">100%</div>
        </div>
        <img
          src="../assets/plus.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <div
          class="h-[1.313rem] w-[0.375rem] relative overflow-hidden shrink-0"
        />
        <img
          src="../assets/full-size.svg"
          class="h-[1rem] w-[1rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
      </div>
      <div class="overflow-hidden flex items-start p-[0.625rem] gap-[0.937rem]">
        <img
          src="../assets/highlight.svg"
          class="h-[1rem] w-[1.063rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <img
          src="../assets/post-it-white.svg"
          class="h-[0.875rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
        <img
          src="../assets/download.svg"
          class="h-[0.938rem] w-[0.875rem] cursor-pointer transition-transform hover:scale-125 hover:brightness-125"
          alt=""
        />
      </div>
    </div>
  </div>
</template>
