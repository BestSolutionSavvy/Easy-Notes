<script setup lang="ts">
import MenuItem from '../components/MenuItem.vue';
import homeIcon from '../assets/home.svg';
import notesIcon from '../assets/post-it-blue.svg';
import classesIcon from '../assets/classes.svg';
import profileIcon from '../assets/profile.svg';
import logo from '../assets/logo.png';

const emit = defineEmits<{
    closeMenu: []
}>();
</script>
<template>
    <div
        class="w-full h-full relative bg-white overflow-y-auto flex flex-col items-start py-[0.812rem] px-[0.937rem] box-border gap-[0.625rem] text-left text-[1.875rem] text-darkslategray font-inter">
        <div
            class="self-stretch h-[4.063rem] relative rounded-lg bg-white box-border overflow-hidden shrink-0">
            <div
                class="absolute top-[calc(50%_-_22.5px)] left-[calc(50%_-_124px)] w-[15.5rem] h-[2.813rem] overflow-hidden shrink-0">
                <img class="absolute top-[0.313rem] left-[1.094rem] w-[2.188rem] h-[2.188rem] object-cover" :src="logo" alt="Easy Notes Logo" />
                <div class="absolute top-[0.281rem] left-[4.219rem] font-semibold">Easy Notes</div>
            </div>
        </div>
        <div
            class="self-stretch flex-1 rounded-lg bg-white box-border flex flex-col items-center py-[1.875rem] px-[0.687rem] gap-[0.937rem] text-[1rem] text-darkslateblue">
            <MenuItem title="Home" :icon="homeIcon" @click="emit('closeMenu')" />
            <MenuItem title="Notes" :icon="notesIcon" @click="emit('closeMenu')" />
            <MenuItem title="Classes" :icon="classesIcon" @click="emit('closeMenu')" />
            <MenuItem title="Profile" :icon="profileIcon" @click="emit('closeMenu')" />
        </div>
    </div>
</template>
