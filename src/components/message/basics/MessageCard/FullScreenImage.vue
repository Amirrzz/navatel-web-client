<template>
  <ion-header>
    <ion-toolbar color="black">
      <ion-buttons :slot="dirIsLtr ? 'end' : 'start'" class="header-buttons">
        <ion-icon
          icon="/Images/tabs/messages/return-back.svg"
          size="large"
          color="white"
          class="return-back-icon"
        >
        </ion-icon>
        <ion-icon
          :icon="ellipsisVertical"
          id="open-popver-fullscreen-options"
          size="large"
          color="white"
        >
        </ion-icon>
        <ion-popover
          trigger="open-popver-fullscreen-options"
          :arrow="false"
          color="black"
        >
          <ion-content class="ion-padding popup-container" color="black">
            <div class="option-item">
              <div class="option-item-logo">
                <ion-icon :icon="eye" color="white"></ion-icon>
              </div>
              <div class="option-item-title">
                {{ t('tabs.message.chatCard.fullScreen.seeInChat') }}
              </div>
            </div>
            <div class="option-item">
              <div class="option-item-logo">
                <ion-icon
                  icon="/Images/tabs/messages/return-back.svg"
                  color="white"
                ></ion-icon>
              </div>
              <div class="option-item-title">
                {{ t('tabs.message.chatCard.fullScreen.forward') }}
              </div>
            </div>
            <div class="option-item">
              <div class="option-item-logo">
                <ion-icon :icon="trash" color="white"></ion-icon>
              </div>
              <div class="option-item-title">
                {{ t('tabs.message.chatCard.fullScreen.delete') }}
              </div>
            </div>
          </ion-content>
        </ion-popover>

        <!-- For open options when user click in 3 dot icon -->
      </ion-buttons>
      <ion-buttons
        :slot="dirIsLtr ? 'start' : 'end'"
        @click="modalController.dismiss('cancel', true)"
        class="header-buttons"
      >
        <ion-icon
          :icon="arrowBack"
          size="large"
          color="white"
          :class="dirIsLtr ? '' : 'fa-back'"
        >
        </ion-icon>
        <span class="text-white">
          {{ t('tabs.message.chatCard.fullScreen.commonMedia') }}
        </span>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <div class="fullscreen-image-container">
    <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="fileData.path"
      :index="indexRef"
    ></vue-easy-lightbox>
  </div>
</template>
<script setup>
import VueEasyLightbox from 'vue-easy-lightbox';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  modalController,
  IonIcon,
  IonContent,
  IonPopover,
} from '@ionic/vue';
import { ellipsisVertical, arrowBack, eye, trash } from 'ionicons/icons';
import { defineProps, ref } from 'vue';

import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const visibleRef = ref(true);
const indexRef = ref(0);

const props = defineProps({
  fileData: {
    type: Object,
    default: () => {},
  },
  dirIsLtr: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
.vel-btns-wrapper {
  display: flex;
}
.vel-icon {
  display: none;
}
ion-toolbar {
  --min-height: 10vh;
  height: 10vh;
  --border-width: 0 !important;
}
ion-title {
  font-size: 24px;
}
ion-popover {
  --offset-x: 0px;
  --offset-y: -30px;
  --width: max-content;
}
.header-buttons {
  display: flex;
  gap: 10px;
  direction: ltr;
}
.font-farsi .header-buttons {
  direction: rtl;
}

.return-back-icon {
  height: 22px;
  width: 25px;
}
.fullscreen-image-container {
  position: relative;
  background: var(--ion-color-black);
  height: 90vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.image-item-full-screen {
  max-width: 100%;
  max-height: 100%;
}
.fa-back {
  transform: rotate(180deg);
}

.font-farsi .popup-container {
  direction: rtl;
}
.option-item {
  display: flex;
  gap: 10px;
  font-size: 18px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
  color: var(--ion-color-white);
}
.option-item-logo {
  display: flex;
}
.option-item-border {
  height: 1px;
  width: calc(100% - 20px);
  border-bottom: 1px solid #92949c91;
  position: relative;
  margin-right: 20px;
}
</style>
