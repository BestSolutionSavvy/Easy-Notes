<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import InputBox from "../components/InputBox.vue";
import PrivacyLink from "../components/PrivacyLink.vue";
import SimpleButton from "../components/SimpleButton.vue";
import type { User } from "../types/user";

const router = useRouter();
const authStore = useAuthStore();

const user = ref<User>({
  email: "",
  role: "student",
  name: "",
  surname: ""
});
const password = ref("");
const errorMessage = ref("");
const fieldErrors = ref({
  email: false,
  password: false
});

const handleSignup = async () => {
  errorMessage.value = "";
  fieldErrors.value = {
    email: false,
    password: false
  };
  
  if (!user.value.email || !password.value) {
    errorMessage.value = "Please fill all required fields";
    fieldErrors.value.email = !user.value.email;
    fieldErrors.value.password = !password.value;
    return;
  }
  const result = await authStore.signup(
    user.value.email, 
    password.value, 
    user.value.role, 
    user.value.name, 
    user.value.surname
  );
  if (result.success) {
    router.push("/profile");
  } else {
    errorMessage.value = result.message;
  }
};
</script>

<template>
  <div
    class="animate-fade-in h-full flex-1 w-full relative rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border text-left text-[1rem] text-gray-300 font-inter"
  >
    <div
      class="w-full flex-1 overflow-hidden flex flex-col items-center justify-center gap-[0.312rem] max-w-full"
    >
      <div class="w-[2.5rem] flex-1 relative overflow-hidden" />
      <div class="relative text-[3rem] font-semibold text-darkslategray">
        Nice to meet you!
      </div>
      <div
        class="w-[19.875rem] overflow-hidden flex flex-col items-center justify-center py-[2.125rem] px-[0rem] box-border gap-[0.625rem]"
      >
        <InputBox v-model="user.name" type="text" placeholder="Name" />
        <InputBox v-model="user.surname" type="text" placeholder="Surname" />
        <InputBox v-model="user.email" type="email" placeholder="E-mail *" :error="fieldErrors.email" />
        <InputBox v-model="password" type="password" placeholder="Password *" :error="fieldErrors.password" />
        <div class="text-xs text-gray-400 self-start">
          <span class="text-red-500">*</span> Required fields
        </div>
        <label class="flex items-center gap-[0.75rem] min-w-[7.5rem] cursor-pointer">
          <input 
            type="radio" 
            v-model="user.role" 
            value="student"
            class="h-[1rem] w-[1rem] relative rounded-full cursor-pointer accent-darkslateblue-100"
          />
          <span class="flex-1 relative leading-[140%]">Student</span>
        </label>
        <label class="flex items-center gap-[0.75rem] min-w-[7.5rem] cursor-pointer">
          <input 
            type="radio" 
            v-model="user.role" 
            value="teacher"
            class="h-[1rem] w-[1rem] relative rounded-full cursor-pointer accent-darkslateblue-100"
          />
          <span class="flex-1 relative leading-[140%]">Teacher</span>
        </label>
        <div
          class="w-[1.875rem] h-[1.188rem] relative overflow-hidden shrink-0"
        />
        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>
        <SimpleButton text="Sign Up" @click="handleSignup" :disabled="authStore.isLoading" />
        <div class="relative text-[0.813rem] font-medium text-darkslategray text-center">
          Already have an account?<br />
          <RouterLink to="/signin" class="underline text-blue-500 hover:underline font-medium">Sign in</RouterLink>
          to access your notes!
        </div>
      </div>
      <div class="w-[2.188rem] flex-1 relative overflow-hidden" />
      <PrivacyLink />
    </div>
  </div>
</template>
