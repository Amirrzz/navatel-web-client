<template>
  <ion-alert
    :is-open="isOpen"
    :message="textHtml"
    :buttons="alertButtons"
    @didDismiss="setOpen(false)"
    cssClass="permission-alert-container"
  ></ion-alert>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonAlert } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const isOpen = ref(false);
const alertButtons = [
  {
    text: t('permissionsModal.notification.no'),
    role: 'cancel',
    handler: askPrmission,
  },
  {
    text: t('permissionsModal.notification.yes'),
    role: 'confirm',
    handler: askPrmission,
  },
];
const textHtml = `
<div class="message-container">
        <div class="icon"></div>
        <div class="message">${t('permissionsModal.notification.text')}</div>
</div>`;

const setOpen = (state) => {
  isOpen.value = state;
};
function askPrmission() {
  if ('Notification' in window) {
    Notification?.requestPermission().then(function (permission) {
      if (permission === 'granted') {
      } else if (permission === 'denied') {
      } else {
      }
    });
  }
}
onMounted(() => {
  setTimeout(() => {
    if (
      Notification.permission === 'granted' ||
      Notification.permission == 'denied'
    ) {
      return;
    }
    isOpen.value = true;
  }, 1000);
});
</script>
<style>
.permission-alert-container .alert-wrapper {
  max-width: 430px;
  margin: 0 16px;
}
.permission-alert-container .message-container {
  font-size: 16px;
  text-align: left;
}
.permission-alert-container .message-container .icon {
  background-image: url('/Images/bell.svg');
  height: 34px;
  background-position: center;
  background-size: cover;
  width: 30px;
  margin: 0 auto;
  margin-bottom: 20px;
}
.permission-alert-container .message-container .message {
  margin-bottom: 30px;
}
.permission-alert-container .alert-wrapper .alert-button-group.sc-ion-alert-md {
  display: flex;
}
.permission-alert-container
  .alert-wrapper
  .alert-button-group.sc-ion-alert-md
  button {
  width: 100%;
  margin: 0 auto;
}
.permission-alert-container
  .alert-wrapper
  .alert-button-group.sc-ion-alert-md
  button
  .alert-button-inner {
  justify-content: center;
}
.font-farsi .permission-alert-container .message-container .message {
  text-align: right;
}
</style>
