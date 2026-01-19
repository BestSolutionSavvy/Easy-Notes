<script setup lang="ts">
defineProps<{
    title: string;
    icon: string;
}>();
</script>
<template>
    <div
        class="w-[14.938rem] h-[2.875rem] shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] rounded-[10px] [background:linear-gradient(90deg,_#ced8ff,_#e5ebff_65.38%,_#f5f7ff)] border-gray border-solid border-[1px] box-border overflow-hidden shrink-0 flex items-center py-[0.625rem] px-[1.125rem] gap-[0.937rem] cursor-pointer hover:opacity-80 transition-opacity">
        <img :src="icon" class="h-[1rem] w-[1rem] relative" alt="" />
        <div class="h-[1rem] relative overflow-hidden shrink-0">
            <div class="absolute top-[0rem] left-[0rem] leading-[100%] font-medium">{{ title }}</div>
        </div>
    </div>
</template>
