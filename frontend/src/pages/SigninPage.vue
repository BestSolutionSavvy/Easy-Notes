<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import InputBox from "../components/InputBox.vue";
import PrivacyLink from "../components/PrivacyLink.vue";
import SimpleButton from "../components/SimpleButton.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const fieldErrors = ref({
  email: false,
  password: false
});

const handleSignin = async () => {
  errorMessage.value = "";
  fieldErrors.value = {
    email: false,
    password: false
  };
  if (!email.value || !password.value) {
    errorMessage.value = "Please fill all fields";
    fieldErrors.value.email = !email.value;
    fieldErrors.value.password = !password.value;
    return;
  }
  const result = await authStore.login(email.value, password.value);
  if (result.success) {
    router.push("/profile");
  } else {
    errorMessage.value = result.message;
  }
};
</script>

<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border text-left text-[1rem] text-gray-200 font-inter"
  >
    <div
      class="w-full flex-1 overflow-hidden flex flex-col items-center justify-center gap-[0.312rem] max-w-full"
    >
      <div class="w-[2.5rem] flex-1 relative overflow-hidden" />
      <div class="relative text-[3rem] font-semibold text-darkslategray">
        Welcome!
      </div>
      <div
        class="w-[19.875rem] overflow-hidden flex flex-col items-center justify-center py-[2.125rem] px-[0rem] box-border gap-[0.625rem]"
      >
        <InputBox v-model="email" type="email" placeholder="E-mail" :error="fieldErrors.email" />
        <InputBox v-model="password" type="password" placeholder="Password" :error="fieldErrors.password" />
        <div class="relative text-[0.813rem] font-medium text-darkslategray text-center">
          Don't have an account yet?<br />
          <RouterLink to="/signup" class="underline text-blue-500 hover:underline font-medium">Sign up</RouterLink>
          for free to bring your notes everywhere!
        </div>
        <div
          class="w-[1.875rem] h-[1.188rem] relative overflow-hidden shrink-0"
        />
        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>
        <SimpleButton text="Sign In" @click="handleSignin" :disabled="authStore.isLoading" />
      </div>
      <div class="w-[2.188rem] flex-1 relative overflow-hidden" />
      <PrivacyLink />
    </div>
  </div>
</template>
