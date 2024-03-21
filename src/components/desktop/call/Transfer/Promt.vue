<template>
  <div class="modal-container" @click="emit('close')">
    <div class="modal-content slid-up-animation">
      <span class="title">{{ $t('desktop.transfer') }}</span>
      <span class="item" @click="emit('openCallPad')">{{
        $t('desktop.callpad')
      }}</span>
      <span class="item" @click="emit('openContacts')">{{
        $t('desktop.contacts')
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['close', 'openContacts', 'openCallPad']);
</script>

<style scoped>
.modal-container {
  direction: ltr;
  position: fixed;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.635) !important;
}

.modal-content {
  width: 350px;
  height: 220px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
}

.modal-content .title {
  font-size: 18px;
  font-weight: 700;
  padding-bottom: 20px;
}

.modal-content .item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding-top: 10px;
  border-bottom: 1px solid #a2a0a093;
  padding-bottom: 5px;
}
</style>
