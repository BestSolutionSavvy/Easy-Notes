<script setup lang="ts">
defineProps<{
    title: string;
    icon: string;
}>();
</script>
<template>
    <RouterLink :to="'/' + title.toLowerCase()"
        class="w-60 h-11 px-4 py-2.5 [background:linear-gradient(90deg,_#fff6df,_#fffbf3_65.38%,_#fffdf8)] rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] flex justify-start items-center gap-3.5 cursor-pointer hover:opacity-85 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
        <img :src="icon" class="w-4 h-4 flex-shrink-0" alt="" />
        <div
            class="flex-1 text-blue-950 text-base font-medium font-['Inter'] leading-4 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ title }}
        </div>
    </RouterLink>
</template>
