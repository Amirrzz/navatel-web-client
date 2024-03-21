<template>
  <div class="call-log-container">
    <span
      v-if="date.isYesterday"
      :class="{ 'text-direction-right': date.isShamsiDate }"
    >
      {{ t('tabs.contacts.yesterday') }}&nbsp;{{ date.value }}</span
    >
    <span v-else :class="{ 'text-direction-right': date.isShamsiDate }">
      {{ date.value }}</span
    >
    <div>{{ t('tabs.callpad.missCall') }}</div>
    <IonIcon icon="/Images/tabs/call-history/miss-outgoing.svg"></IonIcon>
  </div>
</template>
<script setup>
import { defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonIcon } from '@ionic/vue';
const { t } = useI18n();
const props = defineProps({
  date: {
    type: Object,
    default: () => {
      return {
        value: '',
        isShamsiDate: false,
        isYesterday: false,
      };
    },
  },
});
</script>
<style scoped>
.call-log-container {
  background-color: var(--ion-color-bg-input);
  color: var(--ion-color-dark);
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  width: max-content;
  margin: auto;
  padding: 5px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  min-height: 30px;
}

ion-icon {
  width: 20px;
  height: 20px;
}
</style>
