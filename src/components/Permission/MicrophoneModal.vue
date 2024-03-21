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
    text: t('permissionsModal.microphone.no'),
    role: 'cancel',
    handler: askPrmission,
  },
  {
    text: t('permissionsModal.microphone.yes'),
    role: 'confirm',
    handler: askPrmission,
  },
];
const textHtml = `
<div class="message-container">
        <div class="icon"></div>
        <div class="message">${t('permissionsModal.microphone.text')}</div>
</div>`;

const setOpen = (state) => {
  isOpen.value = state;
};
function askPrmission() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Request permission to access the microphone
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        // Permission granted, you can use the microphone now
      })
      .catch(function (error) {
        // Permission denied or an error occurred
        console.error('Error accessing the microphone:', error);
      });
  } else {
    console.error('getUserMedia is not supported in this browser');
  }
}
onMounted(() => {
  setTimeout(() => {
    navigator.permissions
      .query({ name: 'microphone' })
      .then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          // User has granted access to the microphone
          isOpen.value = false;
        } else if (permissionStatus.state === 'prompt') {
          // User has not decided yet, or permission is revocable
          isOpen.value = true;
        } else {
          // User has denied access to the microphone
          isOpen.value = false;
        }
      })
      .catch((error) => {
        // Handle any errors that may occur during the query
        console.error('Error checking microphone permission:', error);
      });
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
