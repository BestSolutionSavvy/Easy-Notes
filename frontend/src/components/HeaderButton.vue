<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const open = ref(false)
const isClosing = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

const position = ref({ top: 0, left: 0 })
const scale = ref({ x: 0.6, y: 0.05 })

async function openOverlay() {
    if (buttonRef.value) {
        const rect = buttonRef.value.getBoundingClientRect()
        isClosing.value = false
        open.value = true
        
        await nextTick()
        
        if (overlayRef.value) {
            const overlayRect = overlayRef.value.getBoundingClientRect()
            
            // Calcola la posizione in base alla direzione
            const left = props.direction === 'right' 
                ? rect.left 
                : rect.right - overlayRect.width
            
            position.value = {
                top: rect.top,
                left: left
            }
            
            scale.value = {
                x: rect.width / overlayRect.width,
                y: rect.height / overlayRect.height
            }
        }
    }
}

function closeOverlay() {
    isClosing.value = true
    setTimeout(() => {
        open.value = false
        isClosing.value = false
    }, 500)
}

const overlayStyle = computed(() => ({
    top: `${position.value.top}px`,
    left: `${position.value.left}px`,
    '--scale-x': scale.value.x,
    '--scale-y': scale.value.y,
    '--origin-x': props.direction === 'right' ? '0%' : '100%'
}))

const buttonOverlayStyle = computed(() => {
    if (!buttonRef.value) return {}
    const rect = buttonRef.value.getBoundingClientRect()
    return {
        top: `${rect.top}px`,
        left: `${rect.left}px`
    }
})

interface Props {
    text?: string;
    icon?: string;
    direction?: 'left' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
    text: '',
    icon: '../assets/close.svg',
    direction: 'right'
});

</script>

<template>
    <!-- Wrapper necessario per il ref -->
    <button ref="buttonRef" @click="openOverlay"
        class="animate-fade-in h-[1.875rem] rounded-num-5 bg-gray-100 overflow-hidden flex items-center justify-center py-[0rem] px-[0.625rem] box-border gap-[0.625rem] cursor-pointer">
        <img :src="props.icon" alt="">
        {{ props.text }}
    </button>

    <!-- Backdrop per chiudere cliccando fuori -->
    <div v-if="open" @click="closeOverlay" class="fixed inset-0 z-40"></div>

    <div v-if="open" class="fixed z-100" :style="buttonOverlayStyle">
        <div :class="['relative']">
            <div @click="closeOverlay"
                class="h-[1.875rem] rounded-num-5 bg-gray-100 overflow-hidden flex items-center justify-center py-[0rem] px-[0.625rem] box-border gap-[0.625rem] cursor-pointer">
                <img :src="props.icon" alt="">
                {{ props.text }}
            </div>
        </div>
    </div>

    <!-- Overlay posizionato dove era il bottone -->
    <div ref="overlayRef" v-if="open" class="fixed z-50" :style="overlayStyle">
        <div @click.stop
            :class="['relative bg-white rounded shadow-lg px-1 pt-8 pb-1', isClosing ? 'scale-out-tl' : 'scale-in-tl']">
            <div :class="['fade-in-content', { 'fade-out-content': isClosing }]">

                <slot></slot>

            </div>
        </div>
    </div>
</template>

<style scoped>
.scale-in-tl {
    animation: scale-in-tl 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

.scale-out-tl {
    animation: scale-out-tl 0.2s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
}

.fade-in-content {
    animation: fade-in 0.1s ease-in 0.1s both;
}

.fade-out-content {
    animation: fade-out 0.1s ease-out both;
}

@keyframes scale-in-tl {
    0% {
        transform: scale(calc(var(--scale-x)*0.88), calc(var(--scale-y)*0.60));
        transform-origin: var(--origin-x, 0%) 0%;
        opacity: 1;
    }

    100% {
        transform: scale(1);
        transform-origin: var(--origin-x, 0%) 0%;
        opacity: 1;
    }
}

@keyframes scale-out-tl {
    0% {
        transform: scale(1);
        transform-origin: var(--origin-x, 0%) 0%;
        opacity: 1;
    }

    100% {
        transform: scale(calc(var(--scale-x)*0.88), calc(var(--scale-y)*0.60));
        transform-origin: var(--origin-x, 0%) 0%;
        opacity: 1;
    }
}

@keyframes fade-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

@keyframes fade-out {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}
</style>