<script setup lang="ts">
import { computed, ref } from "vue";
import RoundIconButton from "../components/AddItemButton.vue";
import plusIcon from "../assets/plus.svg";
import wandIcon from "../assets/wand.svg";
import loadIcon from "../assets/load.svg";
import trashIcon from "../assets/trash.svg";
import ListElement from "../components/ListElement.vue";

interface NoteBook {
  subject: string;
  date: string;
  title: string;
}

const notebooks = ref<NoteBook[]>([
  {
    subject: "Lorem Subject",
    date: "13/11/2025",
    title: "Lorem Ipsum.json (20 Notes)",
  },
  {
    subject: "Lorem Subject",
    date: "13/11/2025",
    title: "Lorem Ipsum.json (20 Notes)",
  },
  {
    subject: "Ipsum Subject",
    date: "13/11/2025",
    title: "Lorem Ipsum.json (20 Notes)",
  },
]);

const subjects = computed(() => {
  const uniqueSubjects = new Set<string>();
  notebooks.value.forEach((notebook) => {
    uniqueSubjects.add(notebook.subject);
  });
  return Array.from(uniqueSubjects);
});

const notebooksPerSubject = computed(() => {
  const map: Record<string, NoteBook[]> = {};
  subjects.value.forEach((subject) => {
    map[subject] = notebooks.value.filter(
      (notebook) => notebook.subject === subject,
    );
  });
  return map;
});
</script>

<template>
  <div
    class="h-full flex-1 w-full relative overflow-hidden shrink-0 flex flex-col items-start text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="self-stretch flex-1 rounded-tl-none rounded-tr-num-8 rounded-br-num-8 rounded-bl-none bg-white overflow-hidden flex flex-col items-center justify-center p-[0.625rem] gap-[1.875rem]">
      <ul>
        <li v-for="subject in subjects" :key="subject"
          class="w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
          <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
            <div class="relative font-semibold">{{ subject }}</div>
            <RoundIconButton :icon="plusIcon" alt="Add Note" :onClick="() => {
                // TODO: Add Note action
              }
              " />
          </div>
          <div
            class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]" />
          <ul class="flex flex-col gap-[0.625rem]">
            <ListElement v-for="(notebook, index) in notebooksPerSubject[subject]" :key="notebook.title"
              :title="notebook.title" :date="notebook.date" :index="index" :buttons="[
                {
                  icon: wandIcon,
                  alt: 'AI Summary',
                  onClick: () => {
                    // TODO: AI Summary action
                  },
                },
                {
                  icon: loadIcon,
                  alt: 'Edit Note',
                  onClick: () => {
                    // TODO: Edit Note action
                  },
                },
                {
                  icon: trashIcon,
                  alt: 'Delete Note',
                  onClick: () => {
                    // TODO: Delete Note action
                  },
                },
              ]" />
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
