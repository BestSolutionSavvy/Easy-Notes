<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import Menu from "../pages/Menu.vue";
import HeaderButton from "./HeaderButton.vue";
import newNotebookIcon from "../assets/new-notebook.svg";
import openNotebookIcon from "../assets/open-notebook.svg";
import saveIcon from "../assets/save.svg";
import closeIcon from "../assets/close.svg";
import shortcutIcon from "../assets/shortcut.svg";
import { formatDateTime } from "../lib/dateFormatter";
import type { Notebook } from "../types/notebook";
import { loadNotebooks } from "../lib/notebookUtils";
import axios from "axios";

interface Props {
  variant?: "default" | "tools";
  username?: string;
  currentNotebook?: Notebook | null;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  currentNotebook: null,
});

const isMenuOpen = ref(false);
const notebookName = ref("");
const pdfName = ref("");
const subjectName = ref("");
const notebooks = ref<Notebook[]>([]);
const classes = ref<string[]>([]);
const isSaving = ref(false);
const saveSuccess = ref(false);
const pdfPerClass = ref<Record<string, Notebook[]>>({});
const authStore = useAuthStore();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const createNotebook = async () => {
  try {
    const response = await fetch("/api/notebooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: notebookName.value,
        subject: subjectName.value,
        date: formatDateTime(new Date().toISOString()),
        owner: "user123",
        type: pdfName.value ? "with_slides" : "simple",
        last_page: 0,
        pages: [],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Reset form
      notebookName.value = "";
      pdfName.value = "";
      subjectName.value = "";
    } else {
      console.error("Errore nella creazione del notebook");
    }
  } catch (error) {
    console.error("Errore:", error);
  }
};

const saveNotebook = async () => {
  console.log("Save notebook triggered");
  if (!props.currentNotebook || isSaving.value) return;
  console.log("Saving notebook:", props.currentNotebook);
  
  isSaving.value = true;
  saveSuccess.value = false;
  
  try {
    const response = await axios.post(`/api/notebooks/${authStore.user?.email}/${props.currentNotebook._id}`, props.currentNotebook);
    if (response.status.toString().startsWith("2")) {
      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
      }, 2000);
    } else {
      console.error("Errore nel salvataggio del notebook");
    }
  } catch (error) {
    console.error("Errore:", error);
  } finally {
    isSaving.value = false;
  }
};

const emit = defineEmits<{
  (e: "open-notebook", notebook: Notebook): void;
  (e: "close-notebook"): void;
}>();

onMounted(async () => {
  notebooks.value = await loadNotebooks(authStore.user?.email || "");
  const allClasses = await axios
    .get(`/api/classes`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Errore nel caricamento delle classi:", error);
      return [];
    });
  const userClassesId =  await axios
    .get(`/api/users/${authStore.user?.email}`)
    .then((response) => response.data.classes)
    .catch((error) => {
      console.error("Errore nel caricamento delle classi:", error);
      return [];
    });

  classes.value = allClasses
    .filter((cls: any) => userClassesId.includes(cls._id));
  console.log("User classes:", classes.value);
});

</script>

<template>
  <div>
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-40"
      @click="isMenuOpen = false"
    ></div>

    <Transition name="slide">
      <div
        v-if="isMenuOpen"
        class="fixed w-80 bg-white shadow-xl z-50 overflow-hidden rounded-xl"
        style="top: 5rem; left: 10px; height: calc(100vh - 5.6rem)"
      >
        <Menu @close-menu="isMenuOpen = false" />
      </div>
    </Transition>

    <header
      class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-300 rounded-[10px] flex justify-start items-center gap-5 overflow-hidden"
    >
      <img
        src="../assets/menuIcon.svg"
        class="w-6 h-5 cursor-pointer menu-icon transition-transform duration-300 hover:scale-125"
        :class="{ 'rotate-180': isMenuOpen }"
        @click="toggleMenu"
      />
      <h1 class="text-white text-[1.563rem] font-semibold font-['Inter']">
        Easy Notes
      </h1>
      <div
        v-if="variant === 'tools'"
        class="animate-fade-in self-stretch flex-1 overflow-hidden flex items-center justify-center text-[1rem] text-[transparent]"
      >
        <div
          class="h-[1.938rem] w-[18.438rem] rounded-[9999px] bg-gray-200 border-gainsboro border-solid border-[1px] box-border overflow-hidden shrink-0 flex items-center py-[0.75rem] px-[1rem] gap-[0.5rem] min-w-[7.5rem]"
        >
          <div class="flex-1 relative leading-[100%] shrink-0">Value</div>
          <img
            src="../assets/search.svg"
            class="h-[1rem] w-[1rem] relative shrink-0"
            alt=""
          />
        </div>
      </div>
      <HeaderButton
        v-if="variant === 'tools'"
        :text="'Create Notebook'"
        :icon="newNotebookIcon"
      >
        <form
          @submit.prevent="createNotebook"
          class="flex flex-col gap-2 p-3 min-w-[16rem]"
        >
          <div class="flex flex-col gap-0.5">
            <label class="text-xs text-gray-600">Nome Notebook *</label>
            <input
              v-model="notebookName"
              type="text"
              required
              class="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
              placeholder="Appunti Lezione 1"
            />
          </div>

          <div class="flex flex-col gap-0.5">
            <label class="text-xs text-gray-600">Nome PDF</label>
            <input
              v-model="pdfName"
              type="text"
              class="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
              placeholder="Capitolo_01.pdf"
            />
          </div>

          <div class="flex flex-col gap-0.5">
            <label class="text-xs text-gray-600">Materia *</label>
            <input
              v-model="subjectName"
              type="text"
              required
              class="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
              placeholder="Matematica"
            />
          </div>

          <button
            type="submit"
            class="mt-1 px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 active:bg-gray-900 transition-colors duration-150"
          >
            Crea
          </button>
        </form>
      </HeaderButton>
      <HeaderButton
        v-if="variant === 'tools'"
        :text="'Open Notebook'"
        :icon="openNotebookIcon"
      >
        <div
          v-for="notebook in notebooks"
          :key="notebook._id"
          class="p-2 hover:bg-gainsboro-100 rounded-md cursor-pointer"
          @click="$emit('open-notebook', notebook)"
        >
          <div class="font-medium text-darkslateblue">{{ notebook.name }}</div>
          <div class="text-sm text-gray-500">{{ notebook.subject }}</div>
        </div>
      </HeaderButton>
      <HeaderButton v-if="variant === 'tools'" :icon="shortcutIcon">
        <div class="flex flex-col gap-1 p-2 max-w-sm max-h-80 overflow-y-auto">
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >← →</kbd
            >
            <span class="text-xs text-gray-700">Naviga pagine</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Enter</kbd
            >
            <span class="text-xs text-gray-700">Inizia modifica</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Esc</kbd
            >
            <span class="text-xs text-gray-700">Esci da modifica</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Ctrl + F</kbd
            >
            <span class="text-xs text-gray-700">Cerca parola chiave</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Ctrl + +/-/Wheel</kbd
            >
            <span class="text-xs text-gray-700">Controlli zoom</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Alt + Drag</kbd
            >
            <span class="text-xs text-gray-700">Pan durante zoom</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Click</kbd
            >
            <span class="text-xs text-gray-700">Rimuovi evidenziazione</span>
          </div>

          <div class="mt-2 pt-1.5 border-t border-gray-300">
            <strong class="text-xs font-bold text-gray-800"
              >Durante la modifica:</strong
            >
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Ctrl + ← →</kbd
            >
            <span class="text-xs text-gray-700">Naviga scrivendo</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Ctrl + S</kbd
            >
            <span class="text-xs text-gray-700">Salva note</span>
          </div>

          <div class="mt-2 pt-1.5 border-t border-gray-300">
            <strong class="text-xs font-bold text-gray-800"
              >Modalità textbox:</strong
            >
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Click + Drag</kbd
            >
            <span class="text-xs text-gray-700">Disegna textbox</span>
          </div>
          <div
            class="flex justify-between items-center py-1.5 border-b border-gray-100"
          >
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Double Click</kbd
            >
            <span class="text-xs text-gray-700">Modifica textbox</span>
          </div>
          <div class="flex justify-between items-center py-1.5">
            <kbd
              class="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded"
              >Click</kbd
            >
            <span class="text-xs text-gray-700">Elimina textbox</span>
          </div>
        </div>
      </HeaderButton>
      <HeaderButton v-if="variant === 'tools'" :text="'Save'" :icon="saveIcon" @open-overlay="saveNotebook">
        <div class="flex flex-col items-center justify-center p-4 min-w-[8rem]">
          <!-- Loading -->
          <div v-if="isSaving" class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span class="text-sm text-gray-600">Salvataggio...</span>
          </div>
          
          <!-- Success -->
          <div v-else-if="saveSuccess" class="flex flex-col items-center gap-2 animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span class="text-sm text-green-600 font-medium">Salvato!</span>
          </div>
        </div>
      </HeaderButton>
      <HeaderButton
        v-if="variant === 'tools'"
        :text="'Close'"
        :icon="closeIcon"
        :direction="'left'"
      >
        <div class="flex flex-col gap-3 p-3 min-w-[14rem] max-w-sm">
          <p class="text-xs text-gray-600">
            Sei sicuro di voler chiudere il notebook? Le modifiche non salvate
            andranno perse.
          </p>
          <button
            @click="$emit('close-notebook')"
            class="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 active:bg-gray-900 transition-colors duration-150"
          >
            Chiudi Notebook
          </button>
        </div>
      </HeaderButton>
      <RouterLink
        v-if="props.username"
        to="/profile"
        class="animate-fade-in flex-1 flex items-center justify-end text-[0.875rem] text-orangered-100"
      >
        <div
          class="rounded-[18px] bg-white overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] gap-[0.312rem] cursor-pointer transition-all duration-200 hover:scale-102 active:scale-97 hover:shadow-s"
        >
          <img
            class="w-[1.125rem] relative shrink-0"
            alt="Username badge icon"
            src="../assets/profile-badge.svg"
          />
          <div class="relative font-medium shrink-0">{{ props.username }}</div>
        </div>
      </RouterLink>
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
