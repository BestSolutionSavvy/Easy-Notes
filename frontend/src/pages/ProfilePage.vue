<script setup lang="ts">
import InputBox from '../components/InputBox.vue';
import SimpleButton from '../components/SimpleButton.vue';

</script>

<template>
    <div
        class="self-stretch h-full px-5 py-12 bg-white rounded-tr-[10px] rounded-br-[10px] flex flex-col justify-center items-center overflow-hidden">
        <div class="flex flex-col justify-center items-center gap-4">
            <div
                class="px-4 py-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full inline-flex justify-center items-center">
                <div class="text-center text-white text-sm font-medium">Student</div>
            </div>
            <div class="text-zinc-700 text-[4rem] font-semibold mb-8">Jane Doe</div>
            <div class="w-96 flex flex-col justify-center items-center gap-4">
                <InputBox placeholder="Jane Doe" type="text"></InputBox>
                <InputBox placeholder="jane@doe.it" type="email"></InputBox>
                <InputBox placeholder="***************" type="password"></InputBox>
                <div class="mt-4">
                    <SimpleButton text="Modify" variant="default"></SimpleButton>
                </div>
            </div>
            <div class="mt-20">
                <SimpleButton text="Delete Account" variant="delete"></SimpleButton>
            </div>
        </div>
    </div>
</template>