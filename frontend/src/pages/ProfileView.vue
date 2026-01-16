<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import MainStructure from '../components/MainStructure.vue'
</script>

<template>
    <div class="min-h-screen bg-gray-100 flex flex-col p-2.5 gap-2.5">
        <!-- Header -->
        <AppHeader />

        <!-- Main Content -->
        <MainStructure>
            <template #left>
                <div
                    class="self-stretch self-stretch px-5 py-7 bg-white rounded-tl-[10px] rounded-bl-[10px] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden">
                    <div
                        class="self-stretch flex-1 flex flex-col justify-center items-center gap-[3px] overflow-hidden">
                        <div class="self-stretch inline-flex justify-center items-center gap-3.5 overflow-hidden">
                            <img class="w-14 h-14" src="../assets/logo.png" />
                            <div class="justify-start text-zinc-700 text-5xl font-semibold font-['Inter']">Easy Notes
                            </div>
                        </div>
                        <div class="self-stretch inline-flex justify-center items-center overflow-hidden">
                            <div class="justify-start text-neutral-500 text-3xl font-semibold font-['Inter']">Note
                                taking made easy</div>
                        </div>
                    </div>
                </div>
            </template>

            <template #right>
                <!-- RIGHT CONTENT -->
            </template>
        </MainStructure>
    </div>
</template>