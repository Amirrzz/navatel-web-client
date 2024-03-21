<template>
  <div class="modal-container">
    <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="fileData.path"
      :index="indexRef"
      @hide="nestedModalsDesktop.fullScreenImageDesktop.state = false"
    ></vue-easy-lightbox>
  </div>
</template>

<script setup>
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop';
import { computed, defineProps, ref } from 'vue';
import VueEasyLightbox from 'vue-easy-lightbox';

const nestedModalsDesktop = useNestedModalsDesktop();
const visibleRef = ref(true);
const indexRef = ref(0);

const fileData = computed(() => {
  return nestedModalsDesktop.fullScreenImageDesktop.data;
});
</script>

<style scoped>
.modal-container {
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00000095;
  animation: 0.3 bg-animation;
}
</style>
