<template>
  <ion-header>
    <ion-toolbar
      color="transparent"
      :dir="dirIsLtr ? 'rtl' : 'ltr'"
      v-show="!selectingChatIsActive"
    >
      <ion-buttons :slot="dirIsLtr ? 'end' : 'start'" class="header-buttons">
        <ion-icon
          :icon="arrowBack"
          size="large"
          color="white"
          :class="dirIsLtr ? '' : 'fa-back'"
          @click="backPageHandler"
        >
        </ion-icon>
        <div class="avatar-container avatar-me-message" v-if="isMySelf">
          <IonIcon
            :icon="bookmarkOutline"
            size="large"
            color="white"
            class="bookmark-itsMySelft"
          ></IonIcon>
        </div>
        <div
          class="avatar-container"
          :class="[avatarClass]"
          @click="openProfileModal"
          v-if="!isMySelf"
        >
          <div class="avatar-char">{{ getFirstChar }}</div>
          <img class="avatar-image" :src="avatar" v-if="avatar" />
        </div>
        <div v-if="isMySelf" class="saved-message-text">
          {{ t('tabs.message.savedMessages') }}
        </div>
        <div
          v-if="!isMySelf"
          class="ellipsis-text username"
          :class="{ 'text-direction-right': nameTextDirectionIsRtl }"
          @click="openProfileModal"
        >
          {{ name }}
        </div>

        <!-- For open options when user click in 3 dot icon -->
      </ion-buttons>
      <ion-buttons :slot="dirIsLtr ? 'start' : 'end'" class="header-buttons">
        <ion-icon
          :icon="videocam"
          size="large"
          color="white"
          @click.self="makeVideoCall"
          v-if="!isMySelf"
        >
        </ion-icon>
        <ion-icon
          :icon="call"
          size="large"
          color="white"
          @click.self="makeVoiceCall"
          v-if="!isMySelf"
        >
        </ion-icon>

        <ion-icon :icon="ellipsisVertical" size="large" color="white">
        </ion-icon>
        <slot name="popover"></slot>
      </ion-buttons>
    </ion-toolbar>

    <!-- ////////selectingChatIsActive///////// -->
    <ion-toolbar
      color="transparent"
      :dir="dirIsLtr ? 'rtl' : 'ltr'"
      v-show="selectingChatIsActive"
    >
      <ion-buttons :slot="dirIsLtr ? 'end' : 'start'" class="header-buttons">
        <ion-icon
          :icon="close"
          size="large"
          color="white"
          @click="emit('resetSelectingChat')"
        >
        </ion-icon>
        <div class="chat-items-length-container">{{ selectedChatCount }}</div>
        <!-- For open options when user click in 3 dot icon -->
      </ion-buttons>
      <ion-buttons :slot="dirIsLtr ? 'start' : 'end'" class="header-buttons">
        <ion-icon
          icon="/Images/tabs/messages/copy.svg"
          size="large"
          color="white"
          @click="sendEmitToParent('onCopy')"
        >
        </ion-icon>
        <ion-icon
          icon="/Images/tabs/messages/forward.svg"
          size="large"
          color="white"
          @click="sendEmitToParent('onForward')"
        >
        </ion-icon>

        <ion-icon
          icon="/Images/tabs/messages/remove.svg"
          size="large"
          color="white"
          @click="sendEmitToParent('onRemove')"
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
const emit = defineEmits([
  'makeVoiceCall',
  'makeVideoCall',
  'openProfileModal',
  'resetSelectingChat',
  'onCopy',
  'onForward',
  'onRemove',
  'back',
]);
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  avatarClass: {
    type: String,
  },
  avatar: {
    type: [String, Boolean],
  },
  isMySelf: {
    type: Boolean,
    default: false,
  },
  dirIsLtr: {
    type: Boolean,
    default: true,
  },
  selectingChatIsActive: {
    type: Boolean,
    default: true,
  },
  selectedChatCount: {
    type: [String, Number],
  },
});
const makeVoiceCall = () => {
  emit('makeVoiceCall');
};
const makeVideoCall = () => {
  emit('makeVideoCall');
};
const openProfileModal = () => {
  emit('openProfileModal');
};

const backPageHandler = () => {
  emit('back');
  modalController.dismiss(false, 'cancel');
};
const getFirstChar = computed(() => {
  return textAvatar(props.name);
});
const nameTextDirectionIsRtl = computed(() => {
  return detectTextDirection(props.name)?.isRightToLeft;
});
const sendEmitToParent = (emitValue) => {
  emit(emitValue);
};
</script>
<style scoped>
ion-header {
  min-height: 10vh;
  max-height: 95px;
  height: 10vh;
  font-size: 32px;
  background: var(--ion-color-primary, #428cff);
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
  max-width: 40vw;
  font-size: calc(22px - 1vw);
  direction: ltr;
  color: var(--ion-color-white);
}

.avatar-container {
  position: relative;
  width: 12vw;
  height: 12vw;
  max-width: 70px;
  max-height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: calc(22px - 1vw);
  color: var(--ion-color-white);
  border-radius: 50%;
  overflow: hidden;
}
.avatar-image {
  width: 100%;
  max-width: 100%;
  height: 100%;
  position: absolute;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-me-message {
  background-color: var(--ion-color-primary);
}
.saved-message-text {
  font-size: calc(22px - 1vw);
  color: var(--ion-color-white);
}

.chat-items-length-container {
  color: var(--ion-color-white);
  font-size: 24px;
}
</style>
