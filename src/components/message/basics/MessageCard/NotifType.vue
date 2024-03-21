<template>
  <div class="notification-type-container">
    <div class="notification-content">{{ content }}</div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useI18n } from 'vue-i18n';

const content = ref('');
const { t } = useI18n();
const contactsStore = useContactsStore();
const props = defineProps({
  source: {
    type: Object,
    default: {},
    required: false,
  },
});

onMounted(async () => {
  if (props.source.type.split('.')[1] == 'add') {
    const information = await contactsStore.getContactInformation(
      props.source.additionalMessageInfo.uuid,
    );
    if (props.source.additionalMessageInfo.userInformation) {
      content.value = ` ${information.name || information.nickname} ${t(
        `tabs.message.group.${props.source.notifyType}`,
      )} ${props.source.additionalMessageInfo.userInformation.name}`;
    }
  } else if (props.source.type.split('.')[1] == 'rmv') {
    const information = await contactsStore.getContactInformation(
      props.source.additionalMessageInfo.uuid,
    );
    if (props.source.additionalMessageInfo.userInformation) {
      content.value = ` ${information.name || information.nickname} ${t(
        `tabs.message.group.${props.source.notifyType}`,
      )} ${props.source.additionalMessageInfo.userInformation.name}`;
    }
  } else {
    if (props.source.additionalMessageInfo.userInformation) {
      content.value = `${t(`tabs.message.group.${props.source.notifyType}`)} ${
        props.source.date.value
      } ${props.source.additionalMessageInfo.userInformation.name}`;
    } else {
      const information = await contactsStore.getContactInformation(
        props.source.additionalMessageInfo.uuid,
      );
      if (information) {
        if (information.name) {
          content.value = `${information.name} ${t(
            `tabs.message.group.${props.source.notifyType}`,
          )} ${props.source.date.value}`;
        } else {
          content.value = `${t(
            `tabs.message.group.${props.source.notifyType}`,
          )} ${props.source.date.value} ${information.nickname}`;
        }
      }
    }
  }
});
</script>

<style scoped>
.notification-type-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notification-content {
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
  margin-top: 5px;
  margin-bottom: 3px;
  font-size: 12px;
  min-height: 30px;
}
</style>
