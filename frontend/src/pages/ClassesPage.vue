<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import axios from "axios";
import ListElement from '../components/ListElement.vue';
import trashIcon from '../assets/trash.svg';
import plusIcon from '../assets/plus.svg';
import subscribedIcon from '../assets/subscribed.svg';
import unsubscribedIcon from '../assets/unsubscribed.svg';
import AddItemButton from "../components/AddItemButton.vue";
import { useAuthStore } from "../stores/auth";
import type { Class } from "../types/class";

const props = defineProps<{
  role?: string;
}>();

const emit = defineEmits<{
  'select-class': [classItem: Class]
}>();

const authStore = useAuthStore();

const classes = ref<Class[]>([]);
const subscribedClassIds = ref<string[]>([]);

const filteredClasses = computed(() => {
  if (props.role === 'teacher') {
    return classes.value.filter(c => subscribedClassIds.value.includes(c._id || ''));
  }
  return classes.value;
});

const listClasses = async () => {
  try {
    const response = await axios.get('/api/classes');
    classes.value = response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    classes.value = [];
  }
};

const fetchUserClasses = async () => {
  if (authStore.user?.email) {
    try {
      const response = await axios.get(`/api/users/${authStore.user.email}`);
      subscribedClassIds.value = response.data.classes || [];
    } catch (error) {
      console.error('Error fetching user classes:', error);
      subscribedClassIds.value = [];
    }
  }
};

const isSubscribed = (classId: string): boolean => {
  return subscribedClassIds.value.includes(classId);
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
  if (!authStore.user?.email) return;

  try {
    const teacherName = authStore.user.name && authStore.user.surname
      ? `${authStore.user.name} ${authStore.user.surname}`
      : authStore.user.email;

    const newClass = {
      name: 'New Class',
      teacher: teacherName,
      date: new Date().toISOString()
    };

    const response = await axios.post('/api/classes', newClass);
    const createdClassId = response.data._id;

    // Add the new class to teacher's classes array
    if (props.role === 'teacher' && createdClassId) {
      const updatedClasses = [...subscribedClassIds.value, createdClassId];

      await axios.put(`/api/users/${authStore.user.email}`, {
        classes: updatedClasses
      });
    }

    // Refresh data from database
    await listClasses();
    await fetchUserClasses();
  } catch (error) {
    console.error('Error creating class:', error);
  }
};

const handleSubscribe = async (classId: string) => {
  if (!authStore.user?.email) return;

  try {
    const isCurrentlySubscribed = isSubscribed(classId);
    const updatedClasses = isCurrentlySubscribed
      ? subscribedClassIds.value.filter(id => id !== classId)
      : [...subscribedClassIds.value, classId];

    await axios.put(`/api/users/${authStore.user.email}`, {
      classes: updatedClasses
    });

    // Refresh from database to ensure consistency
    await fetchUserClasses();
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

onMounted(async () => {
  await listClasses();
  await fetchUserClasses();
});

</script>
<template>
  <div
    class="h-full flex-1 w-full relative bg-white overflow-hidden shrink-0 text-left text-[1rem] text-darkslateblue font-inter">
    <div
      class="absolute top-[calc(50%_-_147px)] left-[calc(50%_-_250px)] w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]">
      <div class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray">
        <div class="relative font-semibold">Classes {{ props.role == "teacher" ? "of " + authStore.user?.name +
          " " + authStore.user?.surname : "" }}</div>
        <AddItemButton v-if="props.role === 'teacher'" :icon="plusIcon" alt="Add Lecture" :onClick="async () => {
          await createClass();
        }
          " />
      </div>
      <ListElement v-for="(classItem, index) in filteredClasses" :key="classItem._id || index"
        :title="`${classItem.name || 'Unknown'} of ${classItem.teacher || 'Unknown'}`"
        :date="formatDate(classItem.date)" :index="index" :buttons="props.role === 'teacher'
          ? [{ icon: trashIcon, alt: 'Delete', onClick: () => handleDelete(classItem._id || '') }]
          : [{
            icon: isSubscribed(classItem._id || '') ? subscribedIcon : unsubscribedIcon,
            alt: isSubscribed(classItem._id || '') ? 'Subscribed' : 'Subscribe',
            onClick: () => handleSubscribe(classItem._id || '')
          }]" @click="$emit('select-class', classItem)" />
    </div>
  </div>
</template>