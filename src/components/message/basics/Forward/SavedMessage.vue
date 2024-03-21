<template>
  <div class="saved-message-container">
    <div class="avatar-me-message">
      <IonIcon
        icon="/Images/tabs/messages/notes.svg"
        size="large"
        color="white"
        class="bookmark-itsMySelft"
      ></IonIcon>
      <slot name="checkmark"></slot>
    </div>
    <div class="content option-item-border">
      <div class="user-information">
        <div class="saved-massages-item">
          {{ t('tabs.message.savedMessages') }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { IonIcon } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<style scoped>
.saved-message-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  direction: ltr;
  font-size: 18px;
  margin-top: 17.5px;
}
.font-farsi .saved-message-container {
  direction: rtl;
}
.avatar-me-message {
  font-size: 32px;
  background-color: var(--ion-color-primary);
  height: 50px;
  width: 50px;
  min-width: 50px;
  min-height: 50px;
  border-radius: 50%;
  text-align: center;
  color: white;
  position: relative;
  margin: 0 3vmin;
}
.bookmark-itsMySelft {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 60%;
  height: 60%;
  opacity: 1;
  transition: 1s;
}
</style>
