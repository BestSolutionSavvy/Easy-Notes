<script setup lang="ts">
import { ref } from 'vue';
import type { Notebook } from '../types/notebook';

const noteContent = ref('');
interface Props {
  notebook?: Notebook | null;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  notebook: null,
  currentPage: 0
});

</script>

<template>
    <div
        class="h-full flex-1 w-full relative rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border gap-[0.625rem] text-center text-[1.25rem] text-darkslategray font-inter">
        <div class="self-stretch overflow-hidden flex items-end py-[0rem] px-[0.625rem]">
            <div class="overflow-hidden flex items-center justify-center gap-[0.312rem]">
                <img src="../assets/notes.svg" class="w-[1rem] relative max-h-full" alt="" />
                <b class="relative">Notes for page {{ props.currentPage }}</b>
                <div class="h-[1.125rem] w-[0.313rem] relative overflow-hidden shrink-0" />
                <div
                    class="rounded-[5px] [background:linear-gradient(90deg,_#25356e,_#4766d4)] overflow-hidden flex items-center justify-center py-[0.187rem] px-[0.312rem] text-[0.875rem] text-gray-100">
                    <div class="relative font-medium">{{ props.currentPage }} of {{ props.notebook?.pages?.length || 0 }}</div>
                </div>
            </div>
        </div>
        <div
            class="self-stretch flex-1 flex flex-col items-start text-left text-[1.5rem] text-gray-500">
            <textarea
                v-model="noteContent"
                class="self-stretch flex-1 rounded-[10px] border-gainsboro-100 border-solid border-[1px] py-[0.937rem] px-[1.25rem] resize-none focus:outline-none text-gray-500 text-[1rem] font-inter leading-normal"
                placeholder="Scrivi qui le tue note..."
            ></textarea>
        </div>
    </div>
</template>

