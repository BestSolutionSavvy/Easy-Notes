<script setup lang="ts">
import { ref } from "vue";
import ListElement from '../components/ListElement.vue';
import trashIcon from '../assets/trash.svg';
import plusIcon from '../assets/plus.svg';
import AddItemButton from "../components/AddItemButton.vue";

const classes = ref([
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  },
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  },
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  },
  {
    title: "Lorem Ipsum.json (100 pages)",
    date: "13/11/2025"
  }
]);

const handleDelete = (index: number) => {
  console.log('Delete class:', index);
};

</script>
<template>
  <div
    class="h-full flex-1 w-full relative bg-white overflow-hidden shrink-0 text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="absolute top-[calc(50%_-_147px)] left-[calc(50%_-_250px)] w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
      <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
        <div class="relative font-semibold">Lorem Lectures - Class 1</div>
        <AddItemButton :icon="plusIcon" alt="Add Lecture" :onClick="() => {
            // !TODO
          }
          " />
      </div>
      <ListElement v-for="(classItem, index) in classes" :key="index" :title="classItem.title" :date="classItem.date"
        :index="index" :buttons="[{ icon: trashIcon, alt: 'Delete', onClick: () => handleDelete(index) }]" />
    </div>
  </div>
</template>