<template>
  <ion-alert
    :is-open="isOpen"
    :message="textHtml"
    :buttons="alertButtons"
    @didDismiss="setOpen(false)"
    cssClass="transfer-promt-container"
  ></ion-alert>
</template>

<script setup>
import { ref, onMounted, defineEmits, nextTick } from 'vue';
import { IonAlert } from '@ionic/vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['openCallPad', 'openContactsList', 'closePromt']);
const { t } = useI18n();

const isOpen = ref(false);
const alertButtons = [
  {
    text: t('tabs.callpad.promt.contacts'),
    role: 'contacts',
    handler: () => {
      emit('openContactsList');
    },
  },
  {
    text: t('tabs.callpad.promt.callPad'),
    role: 'callpad',
    handler: () => {
      emit('openCallPad');
    },
  },
];
const textHtml = `
<div class="message-container">
        <div class='header'>
           <div class='close' onclick="logger" id="closeButtonInTransferPrompt"></div>
           <div class='title'>${t('tabs.callpad.promt.title')}</div>
        </div>
</div>`;

const setOpen = (state) => {
  isOpen.value = state;
};

function getCloseButton() {
  nextTick(() => {
    const element = document.querySelector('#closeButtonInTransferPrompt');
    if (element) {
      element.addEventListener('click', () => {
        emit('closePromt');
        //  alertController.dismiss();
      });
      return;
    }
    setTimeout(() => {
      getCloseButton();
    }, 100);
  });
}
onMounted(() => {
  setTimeout(() => {
    isOpen.value = true;
    getCloseButton();
  }, 10);
});
</script>
<style>
.transfer-promt-container .alert-wrapper {
  max-width: 430px;
  width: 90%;
  margin: 0 16px;
  padding: 0;
}

.transfer-promt-container .message-container {
  font-size: 16px;
  text-align: left;
}
.transfer-promt-container .alert-message {
  -webkit-padding-start: 0;
  padding-inline-start: 0;
  -webkit-padding-end: 0;
  padding-inline-end: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.transfer-promt-container .header {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #0000000d;
  width: 100%;
  position: relative;
  padding: 10px 0;
}
.transfer-promt-container .close {
  position: absolute;
  width: 100%;
  left: 15px;
}
.transfer-promt-container .close::before {
  content: '\2716';
  font:
    normal 1em/1 Arial,
    sans-serif;
  padding: 5px;
}
.transfer-promt-container .alert-wrapper .alert-button-group.sc-ion-alert-md {
  display: flex;
}
.transfer-promt-container
  .alert-wrapper
  .alert-button-group.sc-ion-alert-md
  button {
  width: 100%;
  margin: 0 auto;
  padding: 10px;
}
.transfer-promt-container
  .alert-wrapper
  .alert-button-group.sc-ion-alert-md
  button
  .alert-button-inner {
  justify-content: center;
}
.font-farsi .transfer-promt-container .message-container .message {
  text-align: right;
}
.transfer-promt-container .alert-button-group {
  width: 100%;
  margin: 0 auto;
  display: flex;
}
.transfer-promt-container .alert-button-group button {
  width: 50%;
  display: flex;
  min-height: 50px;
  padding: 65px 0;
}
</style>
