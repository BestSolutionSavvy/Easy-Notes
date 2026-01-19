<script setup lang="ts">
import { ref } from "vue";
import InputBox from "../components/InputBox.vue";
import PrivacyLink from "../components/PrivacyLink.vue";
import SimpleButton from "../components/SimpleButton.vue";

const username = ref("");
const email = ref("");
const password = ref("");
const userRole = ref("student");
</script>

<template>
  <div
    class="h-full flex-1 w-full relative rounded-tl-none rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-gray-100 overflow-hidden shrink-0 flex flex-col items-center justify-center py-[1.875rem] px-[1.25rem] box-border text-left text-[1rem] text-gray-300 font-inter"
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
        <InputBox v-model="username" type="text" placeholder="Username" />
        <InputBox v-model="email" type="email" placeholder="E-mail" />
        <InputBox v-model="password" type="password" placeholder="Password" />
        <label class="flex items-center gap-[0.75rem] min-w-[7.5rem] cursor-pointer">
          <input 
            type="radio" 
            v-model="userRole" 
            value="student"
            class="h-[1rem] w-[1rem] relative rounded-full cursor-pointer accent-darkslateblue"
          />
          <span class="flex-1 relative leading-[140%]">Student</span>
        </label>
        <label class="flex items-center gap-[0.75rem] min-w-[7.5rem] cursor-pointer">
          <input 
            type="radio" 
            v-model="userRole" 
            value="teacher"
            class="h-[1rem] w-[1rem] relative rounded-full cursor-pointer accent-darkslateblue"
          />
          <span class="flex-1 relative leading-[140%]">Teacher</span>
        </label>
        <div
          class="w-[1.875rem] h-[1.188rem] relative overflow-hidden shrink-0"
        />
        <SimpleButton text="Sign Up" />
      </div>
      <div class="w-[2.188rem] flex-1 relative overflow-hidden" />
      <PrivacyLink />
    </div>
  </div>
</template>
