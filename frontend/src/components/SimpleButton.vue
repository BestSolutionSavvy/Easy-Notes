<template>
    <button ref="buttonRef" type="button"
        class="px-4 py-3 rounded-lg inline-flex justify-center items-center gap-2 overflow-hidden ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-200"
        :class="{
            'bg-darkslateblue-100 text-white focus:ring-indigo-500': variant === 'default',
            'bg-orangered-200 text-white focus:ring-red-500': variant === 'delete'
        }" :text="text" :variant="variant" @click="handleClick">
        {{ text }}
    </button>
</template>

<script setup lang="ts">

interface Props {
    text?: string;
    variant?: 'default' | 'delete'
}

const props = withDefaults(defineProps<Props>(), {
    text: 'Modify',
    variant: 'default'
});

const emit = defineEmits(['click']);

const handleClick = (event: any) => {
    emit('click', event);
};
</script>