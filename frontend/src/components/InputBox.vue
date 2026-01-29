<script setup lang="ts">
import { computed, ref } from 'vue';
import eyeIcon from '../assets/eye.svg';
import eyeSlashIcon from '../assets/eye-slash.svg';

interface Props {
  modelValue?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  type: 'text',
  error: false,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const showPassword = ref(false);

const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text';
  }
  return props.type;
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="relative w-full">
    <input
      v-model="value"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full rounded-lg bg-white border-[1px] border-solid py-[0.75rem] px-[1rem] min-w-[7.5rem] leading-[100%] outline-none text-gray-800 placeholder:opacity-70"
      :class="[
        { 'pr-12': type === 'password' },
        { 'opacity-60 cursor-not-allowed': disabled },
        error 
          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-inset focus:ring-red-500' 
          : 'border-gainsboro-200 focus:border-darkslateblue focus:ring-1 focus:ring-inset focus:ring-darkslateblue'
      ]"
    />
    <button
      v-if="type === 'password'"
      type="button"
      @click="togglePasswordVisibility"
      class="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity focus:outline-none"
      tabindex="-1"
    >
      <img 
        :src="showPassword ? eyeSlashIcon : eyeIcon" 
        :alt="showPassword ? 'Hide password' : 'Show password'"
        class="w-5 h-5"
      />
    </button>
  </div>
</template>
