<script setup lang="ts">
import { ref } from 'vue';
import Menu from '../pages/Menu.vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
    <div>
        <div v-if="isMenuOpen" class="fixed inset-0 z-40" @click="isMenuOpen = false"></div>

        <Transition name="slide">
            <div v-if="isMenuOpen" class="fixed w-80 bg-white shadow-xl z-50 overflow-hidden rounded-xl"
                style="top: 5rem; left: 10px; height: calc(100vh - 5.6rem);">
                <Menu @close-menu="isMenuOpen = false" />
            </div>
        </Transition>

        <header
            class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-300 rounded-[10px] flex justify-start items-center gap-5 overflow-hidden">
            <img src="../assets/menuIcon.svg"
                class="w-6 h-5 cursor-pointer menu-icon transition-transform duration-300 hover:scale-125"
                :class="{ 'rotate-180': isMenuOpen }" @click="toggleMenu" />
            <h1 class="text-white text-[1.563rem] font-semibold font-['Inter']">Easy Notes</h1>
        </header>
    </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}
</style>
