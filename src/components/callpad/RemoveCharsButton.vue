<template>
  <button ref="removeCharActionButton" @click="removeLastNumber">
    <slot />
  </button>
</template>
<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { onLongPress } from '@vueuse/core';

const props = defineProps({
  characters: {
    type: String,
    required: true,
  },
});

const removeCharActionButton = ref(null);
const emit = defineEmits(['update:characters']);
const removeLastNumber = () => {
  const numbers = props.characters.slice(0, -1);
  emit('update:characters', numbers);
};
const removeAll = () => {
  emit('update:characters', '');
};
onLongPress(removeCharActionButton, removeAll, {
  modifiers: {
    prevent: false,
  },
});
</script>
