<template>
  <div class="state-chat-container">
    <span v-if="false">{{ t('tabs.message.chatCard.edited') }}</span>
    <span
      v-if="date.isYesterday"
      :class="{ 'text-direction-right': date.isShamsiDate }"
    >
      {{ t('tabs.contacts.yesterday') }}&nbsp;{{ date.value }}</span
    >
    <span v-else :class="{ 'text-direction-right': date.isShamsiDate }">
      {{ date.value }}</span
    >
    <div v-if="itsMe">
      <IonIcon
        :icon="checkmarkDone"
        color="primary"
        v-if="status == 'seen'"
      ></IonIcon>
      <IonIcon
        :icon="checkmark"
        color="primary"
        v-if="status == 'sent'"
      ></IonIcon>
      <IonIcon
        icon="/Images/tabs/messages/pre-send.svg"
        v-if="status == 'sending'"
        color="black"
      ></IonIcon>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { checkmark, checkmarkDone } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { IonIcon } from '@ionic/vue';
import { useLocaleStore } from '@/store/locale.js';

const { t } = useI18n();
const props = defineProps({
  status: {
    type: String,
    default: 'sending',
  },
  itsMe: {
    type: Boolean,
    default: false,
  },
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
/* Content Part End */
.state-chat-container {
  font-size: 8px;
  color: var(--card-time-color);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  min-height: 17px;
}
.state-chat-container-in-image {
  background-color: var(--card-time-color);
  color: var(--card-time-color-in-image);
  border-radius: 5px;
  padding: 1px 4px;
  position: absolute;
  bottom: 5px;
  right: 5px;
}

ion-icon {
  height: 12px;
  width: 12px;
}
</style>
