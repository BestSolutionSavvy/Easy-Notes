<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import Menu from "../pages/Menu.vue";
import HeaderButton from "./HeaderButton.vue";
import ShortcutsList from "./ShortcutsList.vue";
import openNotebookIcon from "../assets/open-notebook.svg";
import saveIcon from "../assets/save.svg";
import closeIcon from "../assets/close.svg";
import shortcutIcon from "../assets/shortcut.svg";
import type { Notebook } from "../types/notebook";
import { loadNotebooks } from "../lib/notebookUtils";
import axios from "axios";

interface Props {
  variant?: "default" | "tools";
  username?: string;
  currentNotebook?: Notebook | null;
  currentNotebookPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  currentNotebook: null,
  currentNotebookPage: 0,
});

const isMenuOpen = ref(false);
const notebooks = ref<Notebook[]>([]);
const classes = ref<string[]>([]);
const isSaving = ref(false);
const saveSuccess = ref(false);
const isEditingName = ref(false);
const editedNotebookName = ref("");
const authStore = useAuthStore();
const openNotebookButtonRef = ref<InstanceType<typeof HeaderButton> | null>(null)
const saveButtonRef = ref<InstanceType<typeof HeaderButton> | null>(null)
const closeButtonRef = ref<InstanceType<typeof HeaderButton> | null>(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const saveNotebook = async () => {
  if (!props.currentNotebook || isSaving.value) return;

  isSaving.value = true;
  saveSuccess.value = false;

  props.currentNotebook.date = new Date().toISOString();
  props.currentNotebook.last_page = props.currentNotebookPage;

  const newNotebook = {
    "name": props.currentNotebook.name,
    "subject": props.currentNotebook.subject,
    "owner": authStore.user?.email || "unknown",
    "type": props.currentNotebook.type || "simple",
    "id_pdf": props.currentNotebook.id_pdf || "",
    "date": props.currentNotebook.date,
    "num_notebook_pages": props.currentNotebook.num_notebook_pages || 0,
    "pages": props.currentNotebook.pages || [],
    "last_page": props.currentNotebook.last_page
  }

  try {
    let response;
    if (props.currentNotebook._id && props.currentNotebook._id !== "") {
      response = await axios.post(`/api/notebooks/${authStore.user?.email}/${props.currentNotebook._id}`, props.currentNotebook);
    } else {
      response = await axios.post(`/api/notebooks/${authStore.user?.email}`, newNotebook);
      if (response.data._id) {
        props.currentNotebook._id = response.data._id;
      }
    }

    if (response.status.toString().startsWith("2")) {
      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
        saveButtonRef.value?.closeOverlay();
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

const startEditingName = () => {
  if (props.currentNotebook) {
    editedNotebookName.value = props.currentNotebook.name;
    isEditingName.value = true;
  }
};

const saveNotebookName = () => {
  if (props.currentNotebook && editedNotebookName.value.trim()) {
    props.currentNotebook.name = editedNotebookName.value.trim();
  }
  isEditingName.value = false;
};

const cancelEditingName = () => {
  isEditingName.value = false;
  editedNotebookName.value = "";
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
  const userClassesId = await axios
    .get(`/api/users/${authStore.user?.email}`)
    .then((response) => response.data.classes)
    .catch((error) => {
      console.error("Errore nel caricamento delle classi:", error);
      return [];
    });

  classes.value = allClasses
    .filter((cls: any) => userClassesId.includes(cls._id));
});

</script>

<template>
  <div>
    <div v-if="isMenuOpen" class="fixed inset-0 z-40" @click="isMenuOpen = false"></div>

    <Transition name="slide">
      <div v-if="isMenuOpen" class="fixed w-80 bg-white shadow-xl z-50 overflow-hidden rounded-xl"
        style="top: 5rem; left: 10px; height: calc(100vh - 5.6rem)">
        <Menu @close-menu="isMenuOpen = false" />
      </div>
    </Transition>

    <header
      class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-300 rounded-[10px] flex items-center overflow-hidden">
      <div class="flex-1 flex items-center justify-start gap-2">
        <img src="../assets/menuIcon.svg"
          class="w-6 h-5 cursor-pointer menu-icon transition-transform duration-300 hover:scale-125"
          :class="{ 'rotate-180': isMenuOpen }" @click="toggleMenu" />
        <h1 class="text-white text-[1.563rem] font-semibold font-['Inter'] px-2">
          Easy Notes
        </h1>
        <div v-if="variant === 'tools' && props.currentNotebook" class="flex items-center gap-3 px-4">
          <div class="relative group">
            <input type="text" placeholder="Search in your notes..."
              class="w-80 h-[1.875rem] pl-10 pr-4 bg-gray-100 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-700 placeholder-gray-400 font-medium transition-all duration-200 hover:bg-gray-200" />
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-if="variant === 'tools' && props.currentNotebook"
        class="flex-1 animate-fade-in overflow-hidden flex items-center justify-center text-[1rem] gap-3">
        <div class="flex items-center max-w-[500px]">
          <div v-if="!isEditingName" @click="startEditingName"
            class="animate-fade-in h-[1.875rem] rounded-[5px] bg-gray-100 overflow-hidden flex items-center justify-center py-[0rem] px-[0.625rem] box-border gap-[0.625rem] cursor-pointer hover:bg-gray-200 transition-all max-w-full">
            <span class="font-medium truncate">{{ props.currentNotebook.name }}</span>
            <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
              </path>
            </svg>
          </div>
          <div v-else class="flex items-center gap-2">
            <input v-model="editedNotebookName" @keydown.enter="saveNotebookName" @keydown.esc="cancelEditingName"
              @blur="saveNotebookName" type="text"
              class="h-[1.875rem] px-[0.625rem] rounded-[5px] bg-gray-100 border-blue-400 border-solid border-2 focus:outline-none focus:border-blue-500 font-medium min-w-[250px] max-w-[450px]"
              autofocus />
          </div>
        </div>
      </div>

      <div class="flex-1 flex items-center justify-end gap-2">
        <HeaderButton ref="openNotebookButtonRef" v-if="variant === 'tools'" :text= "'Open Notebook'" :direction="'left'" :icon="openNotebookIcon">
          <div v-for="notebook in notebooks" :key="notebook._id"
            class="p-2 hover:bg-gainsboro-100 rounded-md cursor-pointer" @click="() => {
              $emit('open-notebook', notebook)
              openNotebookButtonRef?.closeOverlay();
            }">
            <div class="font-medium text-darkslateblue">{{ notebook.name }}</div>
            <div class="text-sm text-gray-500">{{ notebook.subject }}</div>
          </div>
        </HeaderButton>
        <HeaderButton v-if="variant === 'tools' && props.currentNotebook" :icon="shortcutIcon" :direction="'left'">
          <ShortcutsList />
        </HeaderButton>
        <HeaderButton ref="saveButtonRef" v-if="variant === 'tools' && props.currentNotebook" :text="'Save'" :icon="saveIcon" @open-overlay="saveNotebook">
          <div class="flex flex-col items-center justify-center p-4 min-w-[8rem]">
            <div v-if="isSaving" class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span class="text-sm text-gray-600">Salvataggio...</span>
            </div>

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
        <HeaderButton ref="closeButtonRef" v-if="variant === 'tools' && props.currentNotebook" :text="'Close'" :icon="closeIcon" :direction="'left'">
          <div class="flex flex-col gap-3 p-3 min-w-[14rem] max-w-sm">
            <p class="text-xs text-gray-600">
              Sei sicuro di voler chiudere il notebook? Le modifiche non salvate
              andranno perse.
            </p>
            <button @click="() => {
              $emit('close-notebook')
              closeButtonRef?.closeOverlay();
            }"
              class="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 active:bg-gray-900 transition-colors duration-150">
              Chiudi Notebook
            </button>
          </div>
        </HeaderButton>
        <RouterLink v-if="props.username" to="/profile"
          class="animate-fade-in flex-1 flex items-center justify-end text-[0.875rem] text-orangered-100">
          <div
            class="rounded-[18px] bg-white overflow-hidden flex items-center justify-center py-[0.312rem] px-[0.625rem] gap-[0.312rem] cursor-pointer transition-all duration-200 hover:scale-102 active:scale-97 hover:shadow-s">
            <img class="w-[1.125rem] relative shrink-0" alt="Username badge icon" src="../assets/profile-badge.svg" />
            <div class="relative font-medium shrink-0">{{ props.username }}</div>
          </div>
        </RouterLink>
      </div>
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
