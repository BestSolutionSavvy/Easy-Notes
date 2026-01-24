<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";
import MainStructure from "../components/MainStructure.vue";
import LogoPage from "../pages/LogoPage.vue";
import SigninPage from "../pages/SigninPage.vue";
</script>

<template>
  <AppHeader/>
  <MainStructure>
    <template #left>
      <LogoPage />
    </template>
    <template #right>
      <SigninPage />
    </template>
  </MainStructure>
</template>