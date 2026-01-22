<script setup lang="ts">
import { ref } from 'vue';
import Menu from '../pages/Menu.vue';
import HeaderButton from './HeaderButton.vue';
import newNotebookIcon from '../assets/new-notebook.svg';
import openNotebookIcon from '../assets/open-notebook.svg';
import saveIcon from '../assets/save.svg';
import closeIcon from '../assets/close.svg';
import shortcutIcon from '../assets/shortcut.svg';

const isMenuOpen = ref(false);
const notebookName = ref('');
const pdfName = ref('');
const subjectName = ref('');

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const createNotebook = async () => {
    try {
        const response = await fetch('/api/notebooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: notebookName.value,
                subject: subjectName.value,
                date: new Date().toISOString(),
                owner: 'user123',
                type: pdfName.value ? 'with_slides' : 'simple',
                last_page: 0,
                pages: [],
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Notebook creato:', data);
            // Reset form
            notebookName.value = '';
            pdfName.value = '';
            subjectName.value = '';
        } else {
            console.error('Errore nella creazione del notebook');
        }
    } catch (error) {
        console.error('Errore:', error);
    }
};

interface Props {
    variant?: 'default' | 'tools'
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default'
});

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
            <div v-if="variant === 'tools'"
                class="animate-fade-in self-stretch flex-1 overflow-hidden flex items-center justify-center text-[1rem] text-[transparent]">
                <div
                    class="h-[1.938rem] w-[18.438rem] rounded-[9999px] bg-gray-200 border-gainsboro border-solid border-[1px] box-border overflow-hidden shrink-0 flex items-center py-[0.75rem] px-[1rem] gap-[0.5rem] min-w-[7.5rem]">
                    <div class="flex-1 relative leading-[100%] shrink-0">Value</div>
                    <img src="../assets/search.svg" class="h-[1rem] w-[1rem] relative shrink-0" alt="" />
                </div>
            </div>
            <HeaderButton v-if="variant === 'tools'" :text="'Create Notebook'" :icon="newNotebookIcon">
                <form @submit.prevent="createNotebook" class="flex flex-col gap-3 p-4 min-w-[20rem]">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Nome Notebook *</label>
                        <input v-model="notebookName" type="text" required
                            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Es. Appunti Lezione 1" />
                    </div>
                    
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Nome PDF</label>
                        <input v-model="pdfName" type="text"
                            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Es. Capitolo_01.pdf (opzionale)" />
                    </div>
                    
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-medium text-gray-700">Materia *</label>
                        <input v-model="subjectName" type="text" required
                            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Es. Matematica" />
                    </div>
                    
                    <button type="submit"
                        class="mt-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-medium rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                        Crea Notebook
                    </button>
                </form>
            </HeaderButton>
            <HeaderButton v-if="variant === 'tools'" :text="'Open Notebook'" :icon="openNotebookIcon">
                <div class="flex flex-row gap-2 p-2">
                    <button class="px-4 py-2 bg-gainsboro-100 rounded-md text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                        Simple
                    </button>
                    <button class="px-4 py-2 bg-gainsboro-100 rounded-md text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                        With Slides
                    </button>
                </div>
            </HeaderButton>
            <HeaderButton v-if="variant === 'tools'" :icon="shortcutIcon">
                <div class="flex flex-row gap-2 p-2">
                    <button class="px-4 py-2 bg-gainsboro-100 rounded-md text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                        Simple
                    </button>
                    <button class="px-4 py-2 bg-gainsboro-100 rounded-md text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                        With Slides
                    </button>
                </div>
            </HeaderButton>
            <HeaderButton v-if="variant === 'tools'" :text="'Save'" :icon="saveIcon">
                <div class="flex flex-row gap-2 p-2">
                    <button class="px-4 py-2 bg-gainsboro-100 rounded-md text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                        Simple
                    </button>
                </div>
            </HeaderButton>
            <HeaderButton v-if="variant === 'tools'" :text="'Close'" :icon="closeIcon">
                <div class="flex flex-row gap-2 p-2">
                    <button class="px-4 py-2 bg-gainsboro-100 rounded-md text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                        Simple
                    </button>
                </div>
            </HeaderButton>
            

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
