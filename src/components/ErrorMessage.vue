<template>
  <div class="error-message-container" v-if="showingErorr">
    <div class="message-container">
      <div class="header">{{ t('errorMessages.serverSide.title') }}</div>
      <div class="close" @click="closeAlert">&#x2715;</div>
      <div class="message">{{ t('errorMessages.serverSide.text') }}</div>
      <div class="message-sub">{{ t('errorMessages.serverSide.hint') }}</div>
    </div>
    <div class="action-buttons">
      <ion-text color="danger" @click="closeAlert"
        >{{ t('errorMessages.serverSide.close') }}
      </ion-text>
      <ion-text color="success" @click="closeAlert">
        {{ t('errorMessages.serverSide.tryAgain') }}</ion-text
      >
    </div>
  </div>
</template>
<script setup>
import { onUnmounted, computed } from 'vue';
import { IonText } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { useErrorStore } from '@/store/errors.js';
const { t } = useI18n();

const showingErorr = computed(() => {
  const errorStore = useErrorStore();
  return errorStore.showErrorModal;
});
function closeAlert() {
  const errorStore = useErrorStore();
  errorStore.clearErrors();
}

onUnmounted(() => {
  this.closeAlert();
});
</script>

<style scoped>
.error-message-container {
  position: absolute;
  max-width: 490px;
  bottom: 0;
  width: 100vw;
  background-color: var(--ion-color-light);
  padding: 16px;
  text-align: left;
  z-index: 200011;
}

.header {
  color: red;
  font-size: 24px;
  margin-top: 10px;
  margin-bottom: 20px;
}
.font-farsi .error-message-container {
  text-align: right;
  direction: rtl;
}

.message-container {
  position: relative;
  font-size: 16px;
  margin-bottom: 30px;
}
.message,
.message-sub {
  color: var(--ion-color-dark);
}
.close {
  position: absolute;
  top: -10px;
  left: unset;
  right: 0;
  color: #0066ffcc;
  font-weight: 700;
  padding: 5px;
}
.font-farsi .close {
  left: 0;
  right: unset;
}
.action-buttons {
  display: flex;
  width: 100%;
  gap: 20px;
  justify-content: flex-end;
}
ion-text {
  padding: 5px;
}
</style>
