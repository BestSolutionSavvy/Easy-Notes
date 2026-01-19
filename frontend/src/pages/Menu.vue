<script setup lang="ts">
import MenuItem from '../components/MenuItem.vue';
import homeIcon from '../assets/home.svg';
import notesIcon from '../assets/notes.svg';
import classesIcon from '../assets/classes.svg';
import profileIcon from '../assets/profile.svg';
import logo from '../assets/logo.png';
</script>
<template>
    <div
        class="w-full relative bg-white overflow-hidden flex flex-col items-start py-[0.812rem] px-[0.937rem] box-border gap-[0.625rem] text-left text-[1.875rem] text-darkslategray font-inter">
        <div
            class="self-stretch h-[4.063rem] relative rounded-lg bg-white border-orange border-solid border-[3px] box-border overflow-hidden shrink-0">
            <div
                class="absolute top-[calc(50%_-_22.5px)] left-[calc(50%_-_124px)] w-[15.5rem] h-[2.813rem] overflow-hidden shrink-0">
                <img class="absolute top-[0.313rem] left-[1.094rem] w-[2.188rem] h-[2.188rem] object-cover" :src="logo" alt="Easy Notes Logo" />
                <div class="absolute top-[0.281rem] left-[4.219rem] font-semibold">Easy Notes</div>
            </div>
        </div>
        <div
            class="h-[34.063rem] rounded-lg bg-white border-orange border-solid border-[3px] box-border flex flex-col items-start py-[1.875rem] px-[0.687rem] gap-[0.937rem] text-[1rem] text-darkslateblue">
            <MenuItem title="Home" :icon="homeIcon" />
            <MenuItem title="Notes" :icon="notesIcon" />
            <MenuItem title="Classes" :icon="classesIcon" />
            <MenuItem title="Profile" :icon="profileIcon" />
        </div>
    </div>
</template>
