<template>
  <div
    class="core-header"
    :style="{ height: `${height}`, width: `${width}` }"
    :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
  >
    <slot name="headerContent"></slot>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { locale } = useI18n();

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const props = defineProps({
  height: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.core-header {
  background: #428cff;
  border: none;
  box-shadow: 0 0 0;
  color: #fff;
}
</style>
