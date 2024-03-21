<template>
  <div
    class="state-chat-container"
    :class="itsMe ? 'justify-end' : 'justify-start'"
  >
    <span class="username">
      {{ getUserName }}
    </span>
    <span v-if="false">{{ t('tabs.message.chatCard.edited') }}</span>
    <span v-if="formmatedDate.isYesterday">
      {{ t('tabs.contacts.yesterday') }}&nbsp;{{ formmatedDate.value }}</span
    >
    <span v-else> {{ formmatedDate }}</span>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { checkmark, checkmarkDone } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { IonIcon } from '@ionic/vue';
import { dateFormatterHandler } from '@/helpers/dateAndTimeFormatter.js';
import { useLocaleStore } from '@/store/locale.js';
import { useUserStore } from '@/store/user/user.js';

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
    type: String,
  },
  name: {
    type: String,
  },
});
const formmatedDate = computed(() => {
  const localeStore = useLocaleStore();
  const localeFormat = localeStore.getLocaleFormat;
  let dateString = props.date;
  if (dateString?.toString().includes('UTC')) {
    const parts = dateString.split(' ');
    const datePart = parts[0];
    const timePart = parts[1].substring(0, 8);
    const fullDateString = `${datePart}T${timePart}Z`;
    // Create a Date object using the combined date string
    dateString = new Date(fullDateString).toString();
  }
  return dateFormatterHandler(dateString, localeFormat, {
    isFromMessages: true,
    isFromCallHistory: false,
  });
});

const getUserName = computed(() => {
  if (props.itsMe) {
    const userStore = useUserStore();
    return userStore.nickname;
  } else {
    return props.name;
  }
});
</script>

<style scoped>
/* Content Part End */
.state-chat-container {
  font-size: 8px;
  color: var(--ion-color-black);
  display: flex;
  align-items: center;
  gap: 2px;
  min-height: 17px;
}
.justify-start {
  justify-content: flex-start;
}
.justify-end {
  justify-content: flex-end;
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
.username {
  font-weight: 700;
  font-size: 14px;
}
</style>
