<template>
  <div class="core-modal-container fade-animation">
    <MinimizeCall v-if="showCallingModal" />
    <groupChatRoom v-if="groupChatRoomStatus" />
    <otoChatRoom v-if="otoChatRoomStatus" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useCallStore } from '@/store/call/call.js';

const nestedModalsDesktop = useNestedModalsDesktop();

import MinimizeCall from '@/components/desktop/call/MinimizeCall.vue';
import groupChatRoom from './groupChatRoom.vue';
import otoChatRoom from './OTOChatRoom.vue';

const showCallingModal = computed(() => {
  const callStore = useCallStore();
  return callStore.getCallModalStatus.showModal;
});

const groupChatRoomStatus = computed(() => {
  return nestedModalsDesktop.groupChatRoom;
});

const otoChatRoomStatus = computed(() => {
  return nestedModalsDesktop.OTOChatRoom;
});
</script>

<style scoped>
.core-modal-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  direction: ltr;
}

.minimize-animation {
  animation: 6s minimize-animation;
}

@keyframes minimize-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
