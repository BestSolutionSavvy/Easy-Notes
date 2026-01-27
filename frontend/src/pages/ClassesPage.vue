<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import axios from "axios";
import ListElement from "../components/ListElement.vue";
import InputBox from "../components/InputBox.vue";
import SimpleButton from "../components/SimpleButton.vue";
import trashIcon from "../assets/trash.svg";
import plusIcon from "../assets/plus.svg";
import subscribedIcon from "../assets/subscribed.svg";
import unsubscribedIcon from "../assets/unsubscribed.svg";
import AddItemButton from "../components/AddItemButton.vue";
import { useAuthStore } from "../stores/auth";
import type { Class } from "../types/class";
import type { User } from "../types/user";
import { disablePush, enablePush } from "../lib/pushNotifications";

const props = defineProps<{
  role?: string;
}>();

const emit = defineEmits<{
  "select-class": [classItem: Class];
}>();

const authStore = useAuthStore();

const classes = ref<Class[]>([]);
const subscribedClassIds = ref<string[]>([]);
const teachersData = ref<Record<string, User>>({});
const showCreateModal = ref(false);
const newClassName = ref("");

const filteredClasses = computed(() => {
  if (props.role === "teacher") {
    return classes.value.filter((c) =>
      subscribedClassIds.value.includes(c._id || ""),
    );
  }
  return classes.value;
});

const classesByTeacher = computed(() => {
  if (props.role === "teacher") return {};
  
  const grouped: Record<string, Class[]> = {};
  filteredClasses.value.forEach((classItem) => {
    const teacherEmail = classItem.teacher || "unknown";
    if (!grouped[teacherEmail]) {
      grouped[teacherEmail] = [];
    }
    grouped[teacherEmail].push(classItem);
  });
  return grouped;
});

const listClasses = async () => {
  try {
    const response = await axios.get("/api/classes");
    classes.value = response.data;
    
    // Fetch teacher data for students
    if (props.role !== "teacher") {
      const teacherEmails = [...new Set(classes.value.map(c => c.teacher).filter(Boolean))];
      for (const email of teacherEmails) {
        try {
          const teacherResponse = await axios.get(`/api/users/${email}`);
          teachersData.value[email] = teacherResponse.data;
        } catch (error) {
          console.error(`Error fetching teacher ${email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    classes.value = [];
  }
};

const fetchUserClasses = async () => {
  if (authStore.user?.email) {
    try {
      const response = await axios.get(`/api/users/${authStore.user.email}`);
      subscribedClassIds.value = response.data.classes || [];
    } catch (error) {
      console.error("Error fetching user classes:", error);
      subscribedClassIds.value = [];
    }
  }
};

const isSubscribed = (classId: string): boolean => {
  return subscribedClassIds.value.includes(classId);
};

const handleDelete = (index: string) => {
  const classToDelete = classes.value.find(c => c._id === index);
  const className = classToDelete?.name || "this class";
  
  if (!confirm(`Are you sure you want to delete "${className}"?`)) {
    return;
  }
  
  try {
    axios.delete(`/api/classes/${index}`).then(() => {
      listClasses();
    });
  } catch (error) {
    console.error("Error deleting class:", error);
  }
};

const openCreateModal = () => {
  newClassName.value = "";
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  newClassName.value = "";
};

const createClass = async () => {
  if (!authStore.user?.email || !newClassName.value.trim()) return;

  try {
    const newClass = {
      name: newClassName.value.trim(),
      teacher: authStore.user.email,
      date: new Date().toISOString(),
    };

    const response = await axios.post("/api/classes", newClass);
    const createdClassId = response.data._id;

    // Add the new class to teacher's classes array
    if (props.role === "teacher" && createdClassId) {
      const updatedClasses = [...subscribedClassIds.value, createdClassId];

      await axios.put(`/api/users/${authStore.user.email}`, {
        classes: updatedClasses,
      });
    }

    // Refresh data from database
    await listClasses();
    await fetchUserClasses();
    closeCreateModal();
  } catch (error) {
    console.error("Error creating class:", error);
  }
};

const handleSubscribe = async (classId: string) => {
  if (!authStore.user?.email) return;
  
  try {
    const isCurrentlySubscribed = isSubscribed(classId);
    const updatedClasses = isCurrentlySubscribed
      ? subscribedClassIds.value.filter((id) => id !== classId)
      : [...subscribedClassIds.value, classId];

    if (!isCurrentlySubscribed) {
      await enablePush();
    } else {
      await disablePush();
    }

    await axios.put(`/api/users/${authStore.user.email}`, {
      classes: updatedClasses,
    });

    await fetchUserClasses();
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
};

onMounted(async () => {
  await listClasses();
  await fetchUserClasses();
});
</script>
<template>
  <div
    class="h-full flex-1 w-full relative bg-white overflow-hidden shrink-0 text-left text-[1rem] text-darkslateblue font-inter"
  >
    <div
      class="absolute top-[calc(50%_-_147px)] left-[calc(50%_-_250px)] w-[31.25rem] overflow-hidden flex flex-col items-center p-[0.312rem] box-border gap-[0.625rem]"
    >
      <!-- Teacher view -->
      <template v-if="props.role === 'teacher'">
        <div class="animate-fade-in">
          <div
            class="self-stretch flex items-center gap-[0.625rem] text-[1.875rem] text-darkslategray"
          >
            <div class="relative font-semibold">
              Your classes
            </div>
            <AddItemButton
              :icon="plusIcon"
              alt="Add Lecture"
              :onClick="openCreateModal"
            />
          </div>
          <div
            class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]"
          />
        </div>
        <ListElement
          v-for="(classItem, index) in filteredClasses"
          :key="classItem._id || index"
          :title="classItem.name || 'Unknown'"
          :date="classItem.date"
          :index="index"
          :buttons="[
            {
              icon: trashIcon,
              alt: 'Delete',
              onClick: () => handleDelete(classItem._id || ''),
            },
          ]"
          @click="$emit('select-class', classItem)"
        />
      </template>

      <!-- Student view -->
      <template v-else>
        <template v-for="(teacherClasses, teacherEmail) in classesByTeacher" :key="teacherEmail">
          <div class="animate-fade-in w-full">
            <div class="self-stretch flex flex-col gap-[0.125rem] text-darkslategray">
              <div class="relative font-semibold text-[1.875rem]">
                Classes of 
                {{ teachersData[teacherEmail]?.name || 'Unknown' }} 
                {{ teachersData[teacherEmail]?.surname || '' }}
              </div>
              <div class="relative text-[0.875rem] text-left opacity-70">
                {{ teacherEmail }}
              </div>
            </div>
            <div
              class="w-[30.063rem] h-[0.063rem] relative border-black border-solid border-t-[1px] box-border opacity-[0.5]"
            />
          </div>
          <ListElement
            v-for="(classItem, index) in teacherClasses"
            :key="classItem._id || index"
            :title="classItem.name || 'Unknown'"
            :date="classItem.date"
            :index="index"
            :buttons="[
              {
                icon: isSubscribed(classItem._id || '')
                  ? subscribedIcon
                  : unsubscribedIcon,
                alt: isSubscribed(classItem._id || '')
                  ? 'Subscribed'
                  : 'Subscribe',
                onClick: () => handleSubscribe(classItem._id || ''),
              },
            ]"
            @click="$emit('select-class', classItem)"
          />
        </template>
      </template>
    </div>

    <!-- Create Class Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-40"
      @click="closeCreateModal"
    ></div>
    
    <div
      v-if="showCreateModal"
      class="fixed top-[calc(50%_-_100px)] left-[calc(50%_-_200px)] z-50 bg-white rounded-lg shadow-lg p-6 w-[25rem] animate-scale-in"
      @click.stop
    >
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold text-darkslategray">Create New Class</h2>
        <InputBox
          v-model="newClassName"
          type="text"
          placeholder="Class name"
          @keyup.enter="createClass"
        />
        <div class="flex gap-3 justify-end">
          <SimpleButton
            text="Cancel"
            @click="closeCreateModal"
          />
          <SimpleButton
            text="Create"
            @click="createClass"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scale-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
</style>
