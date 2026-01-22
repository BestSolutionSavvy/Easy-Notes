<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import ListElement from '../components/ListElement.vue';
import trashIcon from '../assets/trash.svg';
import plusIcon from '../assets/plus.svg';
import AddItemButton from "../components/AddItemButton.vue";

interface Class {
  _id?: string;
  name: string;
  teacher: string;
  date: string;
}

const classes = ref<Class[]>([]);

const listClasses = async () => {
  try {
    const response = await axios.get('/api/classes');
    classes.value = response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    classes.value = [];
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const handleDelete = (index: string) => {
  try {
    axios.delete(`/api/classes/${index}`).then(() => {
      listClasses();
    });
  } catch (error) {
    console.error('Error deleting class:', error);
  }
};

const createClass = async () => {
  try {
    const newClass = {
      name: 'New Class',
      teacher: 'Unknown Teacher',
      date: new Date().toISOString()
    };
    await axios.post('/api/classes', newClass);
  } catch (error) {
    console.error('Error creating class:', error);
  }
};

onMounted(listClasses);

</script>
<template>
  <div
    class="h-full flex-1 w-full relative bg-white overflow-hidden shrink-0 text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="absolute top-[calc(50%_-_147px)] left-[calc(50%_-_250px)] w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
      <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
        <div class="relative font-semibold">Lorem Ipsum Classes</div>
        <AddItemButton :icon="plusIcon" alt="Add Lecture" :onClick="() => {
          createClass().then(() => {
            listClasses();
          });
        }
          " />
      </div>
      <ListElement v-for="(classItem, index) in classes" :key="classItem._id || index"
        :title="`${classItem.name || 'Unknown'} of ${classItem.teacher || 'Unknown'}`"
        :date="formatDate(classItem.date)" :index="index"
        :buttons="[{ icon: trashIcon, alt: 'Delete', onClick: () => handleDelete(classItem._id || '') }]" />
    </div>
  </div>
</template>