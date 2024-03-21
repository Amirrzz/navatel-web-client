<template>
  <ion-alert
    :is-open="isOpen"
    :message="textHtml"
    :buttons="alertButtons"
    @didDismiss="setOpen(false)"
    cssClass="alert-container"
  ></ion-alert>
</template>

<script setup>
import { IonAlert } from '@ionic/vue';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['changeOpenStatus']);

const alertButtons = [
  {
    text: t('tabs.profile.setting.ok'),
    // text: props.message,
    role: 'confirm',
    // handler: setOpen(false),
  },
];
let textHtml = '';

watch(
  () => props.message,
  (newMessage) => {
    textHtml = `
<div class="message-container">
    <div class="message">${newMessage}</div>
</div>`;
  },
);

const setOpen = () => {
  emit('changeOpenStatus');
};
</script>
<style>
.alert-container .alert-wrapper {
  max-width: 430px;
  margin: 0 16px;
}
.alert-container .message-container {
  font-size: 16px;
  text-align: left;
}
.alert-container .message-container .message {
  margin-bottom: 30px;
}
.alert-container .alert-wrapper .alert-button-group.sc-ion-alert-md {
  display: flex;
}
.alert-container .alert-wrapper .alert-button-group.sc-ion-alert-md button {
  width: 100%;
  margin: 0 auto;
}
.alert-container
  .alert-wrapper
  .alert-button-group.sc-ion-alert-md
  button
  .alert-button-inner {
  justify-content: center;
}
.font-farsi .alert-container .message-container .message {
  text-align: right;
}
</style>
