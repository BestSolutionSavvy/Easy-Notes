<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import axios from "axios";
import InputBox from "../components/InputBox.vue";
import SimpleButton from "../components/SimpleButton.vue";
import ConfirmModal from "../components/ConfirmModal.vue";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const surname = ref("");
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const isModifying = ref(false);
const isDeleting = ref(false);
const isEditMode = ref(false);
const isLoggingOut = ref(false);
const showDeleteModal = ref(false);

const passwordPlaceholder = computed(() => {
  return isEditMode.value ? "New Password (or leave empty)" : "********";
});

// Handles the modify user information button click
const handleModify = async () => {
  if (!isEditMode.value) {
    isEditMode.value = true;
    errorMessage.value = "";
    successMessage.value = "";
    return;
  }
  errorMessage.value = "";
  successMessage.value = "";
  if (!authStore.user?.email) return;
  isModifying.value = true;
  try {
    const updateData: any = {
      name: name.value,
      surname: surname.value,
      role: authStore.user.role,
    };
    if (password.value) {
      updateData.password = password.value;
    }
    await axios.put(`/api/users/${authStore.user.email}`, updateData);
    successMessage.value = "Profile updated successfully!";
    password.value = "";
    isEditMode.value = false;
    setTimeout(() => {
      successMessage.value = "";
    }, 2000);
    await authStore.verifyToken();
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || "Failed to update profile";
  } finally {
    isModifying.value = false;
  }
};

// Handles the delete account button click
const handleDeleteAccount = async () => {
  if (!authStore.user?.email) return;
  showDeleteModal.value = true;
};

// Confirms the account deletion
const onConfirmDelete = async () => {
  showDeleteModal.value = false;
  if (!authStore.user?.email) return;
  isDeleting.value = true;
  try {
    await axios.delete(`/api/users/${authStore.user.email}`);
    await authStore.logout();
    router.push("/signin");
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || "Failed to delete account";
    isDeleting.value = false;
  }
};

// Cancels the account deletion
const onCancelDelete = () => {
  showDeleteModal.value = false;
};

// Handles the logout button click
const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await authStore.logout();
    router.push("/signin");
  } catch (error: any) {
    errorMessage.value = "Failed to logout";
    isLoggingOut.value = false;
  }
};

// Loads the user information from the auth store
onMounted(() => {
  if (authStore.user) {
    email.value = authStore.user.email || "";
    name.value = authStore.user.name || "";
    surname.value = authStore.user.surname || "";
  }
});
</script>

<template>
  <div
    class="animate-fade-in self-stretch h-full px-5 bg-white rounded-tr-[10px] rounded-br-[10px] flex flex-col justify-center items-center overflow-hidden"
  >
    <div class="flex flex-col justify-center items-center gap-4">
      <div
        class="px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full inline-flex justify-center items-center"
      >
        <div class="text-center text-white text-sm font-medium capitalize">
          {{ authStore.user?.role || "User" }}
        </div>
      </div>
      <div class="text-zinc-700 text-[3rem] font-semibold mb-3">
        {{ name + " " + surname }}
      </div>
      <div class="w-96 flex flex-col justify-center items-center gap-4">
        <InputBox
          v-model="name"
          placeholder="Name"
          type="text"
          :disabled="!isEditMode"
        ></InputBox>
        <InputBox
          v-model="surname"
          placeholder="Surname"
          type="text"
          :disabled="!isEditMode"
        ></InputBox>
        <InputBox
          v-model="email"
          placeholder="Email"
          type="email"
          :disabled="true"
        ></InputBox>
        <InputBox
          v-model="password"
          :placeholder="passwordPlaceholder"
          type="password"
          :disabled="!isEditMode"
        ></InputBox>

        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="text-green-500 text-sm text-center">
          {{ successMessage }}
        </div>

        <div class="mt-2">
          <SimpleButton
            :text="isEditMode ? 'Confirm' : 'Modify'"
            variant="default"
            @click="handleModify"
            :disabled="isModifying"
          ></SimpleButton>
        </div>
      </div>
      <div class="mt-14 flex flex-row gap-3">
        <SimpleButton
          text="Logout"
          variant="default"
          @click="handleLogout"
          :disabled="isLoggingOut"
        ></SimpleButton>
        <SimpleButton
          text="Delete Account"
          variant="delete"
          @click="handleDeleteAccount"
          :disabled="isDeleting"
        ></SimpleButton>
      </div>
    </div>
    
    <ConfirmModal
      :isOpen="showDeleteModal"
      title="Delete Account"
      message="Are you sure you want to delete your account? This will permanently delete your account, all your classes, and all associated PDFs. This action cannot be undone."
      confirmText="Delete Account"
      cancelText="Cancel"
      variant="delete"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />
  </div>
</template>
