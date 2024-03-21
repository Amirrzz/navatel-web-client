<template>
  <div class="minimize-call-content">
    <div class="close-btn-container">
      <ion-icon
        @click="endCall"
        :icon="close"
        :size="'small'"
        style="cursor: pointer"
      ></ion-icon>
    </div>

    <div
      class="text-white information-content"
      v-if="connectionInformation.callState && !inComponentAcceptCallState"
    >
      <span v-if="connectionInformation.targetUserInformation.name">
        {{ connectionInformation.targetUserInformation.name }}
      </span>
      <span v-else>
        {{ connectionInformation.targetUserInformation.phoneNumber }}
      </span>
      <KeepAlive>
        <DurationDuringCall
          v-if="connectionInformation.isInConversation"
          :sessionId="connectionInformation.callId"
          :isOutGoing="connectionInformation.isOutgoing"
        ></DurationDuringCall>
      </KeepAlive>
    </div>

    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
      "
    >
      <span class="font-size-24">{{ $t('desktop.freeCall') }}</span>
    </div>

    <div class="avatar">
      <ion-icon
        icon="/Images/tabs/call-pad/calling/avatar.svg"
        class="avatar-container"
        :class="{ 'opacity-0': avatarLoaded && gettingImage }"
      />
      <img
        class="user-image avatar-container"
        v-if="gettingImage"
        :src="gettingImage"
        :class="{ 'user-image-show': avatarLoaded }"
        @load="showUserImage"
      />
    </div>

    <div class="action-button-container">
      <button
        @click="endCall"
        class="end-call-button ion-activatable ripple-parent"
      >
        <img
          style="width: 25px; height: 25px"
          src="/Images/tabs/end-call.svg"
          alt=""
        />
        <ion-ripple-effect></ion-ripple-effect>
      </button>

      <button
        @click="acceptCall"
        class="answer-call-button ion-activatable ripple-parent"
        v-if="
          connectionInformation.isIncoming &&
          !connectionInformation.isInConversation
        "
      >
        <img
          style="width: 20px; height: 20px"
          src="/Images/tabs/answer.svg"
          alt=""
        />
        <ion-ripple-effect></ion-ripple-effect>
      </button>

      <button
        @click="fullScreen"
        class="full-screen-button ion-activatable ripple-parent"
      >
        <img
          style="width: 20px; height: 20px"
          src="/Images/tabs/full-screen.svg"
          alt=""
        />
        <ion-ripple-effect></ion-ripple-effect>
      </button>
    </div>
  </div>
</template>

<script setup>
import { IonIcon, IonRippleEffect } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { ref, defineProps, computed } from 'vue';
import { useCallStore, triggerRingBackAudio } from '@/store/call/call';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

import DurationDuringCall from '@/components/callpad/DurationDuringCall.vue';

const nestedModalsDesktop = useNestedModalsDesktop();

const gettingImage = computed(() => {
  const avatarFileId = connectionInformation.value.targetUserInformation.avatar;
  const fileManagerStore = useFileManagerStore();
  const image = fileManagerStore.usersAvatarBlobList[avatarFileId];
  if (image && image.mainFile) {
    return image.mainFile;
  }
  return false;
});

const connectionInformation = computed(() => {
  const callStore = useCallStore();
  return callStore.getCallModalStatus;
});

const activeSessionId = computed(() => {
  const callStore = useCallStore();
  return callStore.activeReferalCallId || callStore.activeCallId;
});

const props = defineProps({
  isRinging: {
    type: Boolean,
    default: false,
  },
});

const inComponentAcceptCallState = ref(false);
const targetUserPhoneNumberForTransfer = ref('');

const fullScreen = () => {
  nestedModalsDesktop.callingModalState = true;
  nestedModalsDesktop.fullScreenCall = true;
  nestedModalsDesktop.minimizeCallState = false;
};

const acceptCall = () => {
  inComponentAcceptCallState.value = true;
  const callStore = useCallStore();
  callStore.answerTheCall(activeSessionId.value);
};

const endCall = async () => {
  const callStore = useCallStore();
  triggerRingBackAudio(false);
  callStore.endingCallHandler(activeSessionId.value);
};

const avatarLoaded = ref(false);
const showUserImage = (event) => {
  avatarLoaded.value = true;
};

const callReferal = () => {
  const callStore = useCallStore();
  callStore.handlerReferTheCall(
    targetUserPhoneNumberForTransfer.value.phoneNumber,
    targetUserPhoneNumberForTransfer.value.type,
  );
};
</script>

<style scoped>
.minimize-call-content {
  position: fixed;
  z-index: 9999999;
  background: #4d545f;
  color: #fff;
  width: 220px;
  height: 250px;
  left: 0;
  top: 0;
  margin-left: 10px;
  margin-top: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.information-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.close-btn-container {
  width: 100%;
  display: flex;
  justify-content: end;
  padding: 5px 5px;
}

.avatar-container {
  width: 100%;
  height: 100%;
}
.avatar {
  max-height: 100px;
  max-width: 100px;
  width: 50vw;
  height: 50vw;
  position: relative;
  overflow: hidden;
}

.action-button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.end-call-button {
  width: calc(50px - 1vh);
  min-height: calc(50px - 1vh);
  background-color: #f81d1d;
  border-radius: 100%;
  transition: 0.3s;
  transform-origin: center;
  margin: 10px;
}

.answer-call-button {
  width: calc(50px - 1vh);
  min-height: calc(50px - 1vh);
  background-color: #06c754;
  border-radius: 100%;
  transition: 0.3s;
  transform-origin: center;
  margin: 20px;
}

.full-screen-button {
  width: calc(50px - 1vh);
  min-height: calc(50px - 1vh);
  background-color: #6b6d6f;
  border-radius: 100%;
  transition: 0.3s;
  transform-origin: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
