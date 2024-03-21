<template>
  <ion-content class="ion-padding options-container">
    <div class="option-item" @click="eventHandler('onReply')">
      <div class="option-item-logo">
        <ion-icon
          icon="/Images/tabs/messages/reply.svg"
          color="dark"
        ></ion-icon>
      </div>
      <div class="option-item-title">
        {{ t('tabs.message.replay') }}
      </div>
    </div>
    <div class="option-item" @click="eventHandler('onCopy')">
      <div class="option-item-logo">
        <ion-icon icon="/Images/tabs/messages/copy.svg" color="dark"></ion-icon>
      </div>
      <div class="option-item-title">
        {{ t('tabs.message.copy') }}
      </div>
    </div>
    <div class="option-item" @click="eventHandler('onForward')">
      <div class="option-item-logo">
        <ion-icon
          icon="/Images/tabs/messages/forward.svg"
          color="dark"
        ></ion-icon>
      </div>
      <div class="option-item-title">
        {{ t('tabs.message.forward') }}
      </div>
    </div>
    <div class="option-item" @click="eventHandler('onRemove')">
      <div class="option-item-logo">
        <ion-icon
          icon="/Images/tabs/messages/remove.svg"
          color="dark"
        ></ion-icon>
      </div>
      <div class="option-item-title">
        {{ t('tabs.message.remove') }}
      </div>
    </div>
  </ion-content>
</template>

<script setup>
import { IonContent, IonIcon, popoverController } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const eventHandler = (event) => {
  popoverController.dismiss(event, 'confirm');
};
</script>
<style scoped>
ion-content::part(scroll) {
  overflow: hidden;
}
.font-farsi .options-container {
  direction: rtl;
}
.option-item {
  display: flex;
  gap: 10px;
  font-size: 18px;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 10px;
  color: var(--ion-color-dark);
  cursor: pointer;
}
</style>
