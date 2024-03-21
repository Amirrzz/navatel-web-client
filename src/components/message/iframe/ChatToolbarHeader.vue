<template>
  <ion-header>
    <ion-toolbar dir="rtl" color="transparent" v-show="!selectingChatIsActive">
      <div slot="start">
        <div class="ellipsis-text username">
          {{ name }}
        </div>
        <div class="ellipsis-text subtitle">چت حین مکالمه</div>
      </div>
    </ion-toolbar>

    <!-- ////////selectingChatIsActive///////// -->
    <ion-toolbar dir="rtl" color="transparent" v-show="selectingChatIsActive">
      <ion-buttons slot="start" class="header-buttons">
        <ion-icon
          :icon="close"
          size="large"
          color="black"
          @click="emit('resetSelectingChat')"
        >
        </ion-icon>
        <div class="chat-items-length-container">{{ selectedChatCount }}</div>
        <!-- For open options when user click in 3 dot icon -->
      </ion-buttons>
      <ion-buttons slot="end" class="header-buttons">
        <ion-icon
          icon="/Images/tabs/messages/copy.svg"
          size="large"
          color="black"
          @click="sendEmitToParent('onCopy')"
        >
        </ion-icon>

        <ion-icon
          icon="/Images/tabs/messages/remove.svg"
          size="large"
          color="black"
          @click="sendEmitToParent('onRemove')"
          class="ml-3"
        >
        </ion-icon>
        <slot name="popover"></slot>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup>
import {
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButtons,
  modalController,
} from '@ionic/vue';
import {
  ellipsisVertical,
  arrowBack,
  call,
  videocam,
  bookmarkOutline,
  close,
} from 'ionicons/icons';
import { computed, defineProps, defineEmits } from 'vue';
import { textAvatar, detectTextDirection } from '@/helpers/textFormatter.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const emit = defineEmits(['resetSelectingChat', 'onCopy', 'onRemove']);
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  selectingChatIsActive: {
    type: Boolean,
    default: true,
  },
  selectedChatCount: {
    type: [String, Number],
  },
});

const sendEmitToParent = (emitValue) => {
  emit(emitValue);
};
</script>
<style scoped>
ion-header {
  height: 50px;
  font-size: 32px;
  background: #fff;
  --border-width: 0 !important;
}
ion-toolbar {
  height: 100%;
  width: 100%;
  display: flex;
}
ion-header {
  box-shadow: unset;
  direction: ltr;
}
ion-content {
  position: static;
}
ion-toolbar {
  padding-left: 5px;
}
:host .ionicon {
  stroke: var(--ion-color-white) !important;
}
ion-header ion-icon {
  width: 30px;
  height: 30px;
}
.font-farsi ion-toolbar {
  direction: rtl;
}
ion-title {
  font-size: 32px;
}
.header-buttons {
  display: flex;
  gap: 10px;
  direction: ltr;
}
.font-farsi .header-buttons {
  direction: rtl;
}
.fa-back {
  transform: rotate(180deg);
}
.username {
  font-size: calc(22px - 1vw);
  direction: ltr;
  color: #000;
  padding-top: 10px;
  padding-right: 10px;
}
.subtitle {
  font-size: calc(18px - 1vw);
  color: #000;
  padding-bottom: 10px;
  padding-right: 10px;
}

.saved-message-text {
  font-size: calc(22px - 1vw);
  color: var(--ion-color-white);
}

.chat-items-length-container {
  color: var(--ion-color-black);
  font-size: 24px;
}

.ml-3 {
  margin-left: 3rem;
}
</style>
