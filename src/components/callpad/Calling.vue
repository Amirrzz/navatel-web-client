<template>
  <div class="calling-container" @click.self="triggerButtons(true)">
    <ion-icon
      :icon="radioOutline"
      size="large"
      class="sensor-icon-container fade-in-animation"
      v-if="connectionInformation.isInConversation"
      :color="connectionInformation.isReallyConnected ? 'success' : 'danger'"
    ></ion-icon>
    <ion-text class="text-white ellipsis-2-line">
      <h1>{{ connectionInformation.targetUserInformation.name || '' }}</h1>
    </ion-text>
    <ion-text
      class="text-white font-size-18"
      v-show="connectionInformation.calltype"
    >
      {{ t('tabs.callpad.' + connectionInformation.calltype) }}</ion-text
    >
    <div class="font-size-16 mt-10">
      <div
        v-if="
          connectionInformation.callState &&
          !inComponentAcceptCallState &&
          !connectionInformation.isIncoming
        "
        class="flex-container text-white"
      >
        {{ t(`tabs.callpad.` + connectionInformation.callState) }}
        <DurationDuringCall
          v-if="connectionInformation.isInConversation"
          :sessionId="connectionInformation.callId"
          :isOutGoing="connectionInformation.isOutgoing"
        ></DurationDuringCall>
      </div>

      <div v-if="inComponentAcceptCallState" class="flex-container text-white">
        {{ t(`tabs.callpad.` + connectionInformation.callState) }}
        <DurationDuringCall
          :sessionId="connectionInformation.callId"
          :isOutGoing="connectionInformation.isOutgoing"
        ></DurationDuringCall>
      </div>
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

    <div
      class="calling-options"
      :class="{
        'fade-out': !connectionInformation.showKeys || buttonsInHideState,
      }"
    >
      <div class="ion-text-center">
        <button
          @click="triggerMic"
          class="option-button ion-activatable ripple-parent rounded-rectangle"
        >
          <ion-icon
            icon="/Images/tabs/call-pad/calling/mic.svg"
            class="padd-icon"
            v-show="!connectionInformation.isMute"
          />
          <ion-icon
            icon="/Images/tabs/call-pad/calling/mic-off.svg"
            class="padd-icon"
            v-show="connectionInformation.isMute"
          />
          <ion-ripple-effect></ion-ripple-effect>
        </button>
        <div class="text-white button-text">
          {{ t('tabs.callpad.mute') }}
        </div>
      </div>
      <div class="ion-text-center">
        <button
          @click="triggerHold"
          class="option-button ion-activatable ripple-parent rounded-rectangle"
          :class="{
            'active-icon':
              connectionInformation.isHold ||
              connectionInformation.callState == 'hold',
          }"
        >
          <ion-icon
            icon="/Images/tabs/call-pad/calling/hold.svg"
            class="padd-icon"
          />
          <ion-ripple-effect></ion-ripple-effect>
        </button>
        <div class="text-white button-text">
          {{ t('tabs.callpad.hold') }}
        </div>
      </div>
      <div class="ion-text-center">
        <button
          @click="triggerSpeaker"
          class="option-button ion-activatable ripple-parent rounded-rectangle"
        >
          <ion-icon
            icon="/Images/tabs/call-pad/calling/speaker.svg"
            class="padd-icon"
            v-show="speakerOn"
          />
          <ion-icon
            icon="/Images/tabs/call-pad/calling/speaker-off.svg"
            class="padd-icon"
            v-show="!speakerOn"
          />
          <ion-ripple-effect></ion-ripple-effect>
        </button>
        <div class="text-white button-text">
          {{ t('tabs.callpad.speaker') }}
        </div>
      </div>
      <div class="ion-text-center">
        <button
          @click="triggerDialPad"
          class="option-button ion-activatable ripple-parent rounded-rectangle"
        >
          <ion-icon
            icon="/Images/tabs/call-pad/calling/pad.svg"
            class="padd-icon"
          />
          <ion-ripple-effect></ion-ripple-effect>
        </button>
        <div class="text-white button-text">
          {{ t('tabs.callpad.keypad') }}
        </div>
      </div>
      <!-- This empty div is required for ui -->
      <div @click.self="callReferal(true)"></div>
      <div class="ion-text-center">
        <button
          @click="triggerTransfer"
          class="option-button ion-activatable ripple-parent rounded-rectangle"
          :class="{
            'active-icon': isReadyForTransfer,
          }"
        >
          <ion-icon
            icon="/Images/tabs/call-pad/calling/translate.svg"
            class="padd-icon"
          />
          <ion-ripple-effect></ion-ripple-effect>
        </button>
        <div class="text-white button-text">
          {{ t('tabs.callpad.transition') }}
        </div>
      </div>
    </div>
    <!-- {{ connectionInformation }} -->
    <div
      class="action-buttons"
      @click.self="triggerButtons(true)"
      :class="{ 'fade-out': buttonsInHideState }"
    >
      <button
        class="end-call-button accept-call-button ion-activatable ripple-parent"
        @click="acceptCall"
        :class="{
          'fade-out':
            !connectionInformation.isIncoming ||
            connectionInformation.isInConversation,
        }"
      >
        <ion-icon icon="/Images/tabs/call-pad/phone.svg" class="padd-icon" />
        <ion-ripple-effect></ion-ripple-effect>
      </button>
      <button
        class="end-call-button ion-activatable ripple-parent"
        @click="endCall"
        :class="{
          'move-to-center':
            !connectionInformation.isIncoming ||
            connectionInformation.isInConversation,
          'end-call-button-during-ringing':
            (!connectionInformation.isOutgoing || inComponentAcceptCallState) &&
            !connectionInformation.isInConversation &&
            !connectionInformation.isOutgoing &&
            !connectionInformation.isIncoming,
          'end-call-button-during-calling':
            connectionInformation.isInConversation ||
            connectionInformation.isOutgoing,
        }"
      >
        <ion-icon icon="/Images/tabs/call-pad/phone.svg" class="padd-icon" />
        <ion-ripple-effect></ion-ripple-effect>
      </button>
    </div>
    <TransferPromt
      v-if="transferPromtIsOpen"
      @closePromt="closeTransformPromt"
      @openCallPad="openCallPadModal"
      @openContactsList="openContactsInTransformModal"
      @didDismiss="closeTransformPromt"
    />
  </div>
  <div
    class="show-buttons-in-hide-state"
    :class="{ 'slide-up': buttonsInHideState }"
  >
    <div @click="triggerButtons(false)" class="ion-padding">
      <ion-icon
        :icon="chevronUpOutline"
        class="arrow-show-buttons-icon"
        :class="{ show: buttonsInHideState }"
      />
      {{ t('tabs.callpad.showButtons') }}
    </div>
  </div>
</template>
<script setup>
// you should use this component for incoming and outgoing call events
// by is Ringing you can trigger state of this component
import { IonText, IonIcon, IonRippleEffect, modalController } from '@ionic/vue';
import { chevronUpOutline, radioOutline } from 'ionicons/icons';
import { ref, defineProps, computed } from 'vue';
import KeyPadOnDuringCallModal from '@/components/callpad/KeyPadOnDuringCall.vue';
import { useI18n } from 'vue-i18n';
import TransferPromt from '@/components/callpad/Transfer/Promt.vue';
import BaseCallPad from '@/components/callpad/CallpadModal.vue';
import ContactsInTransformModal from '@/components/callpad/Transfer/Contacts.vue';
import DurationDuringCall from '@/components/callpad/DurationDuringCall.vue';
import { useCallStore, triggerRingBackAudio } from '@/store/call/call';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';

const { t } = useI18n();

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

const buttonsInHideState = ref(false);
const inComponentAcceptCallState = ref(false);
const micOn = ref(true);
const isHold = ref(false);
const speakerOn = ref(false);
const isReadyForTransfer = ref(false);
const targetUserPhoneNumberForTransfer = ref('');
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
const triggerMic = () => {
  const callStore = useCallStore();
  if (micOn.value) {
    callStore.muteTheCall(activeSessionId.value);
  } else {
    callStore.unmuteTheCall(activeSessionId.value);
  }
  micOn.value = !micOn.value;
};
const triggerHold = () => {
  const callStore = useCallStore();
  if (!isHold.value) {
    callStore.holdTheCall(activeSessionId.value);
  } else {
    callStore.unholdTheCall(activeSessionId.value);
  }
  isHold.value = !isHold.value;
};
const triggerSpeaker = () => {
  const callStore = useCallStore();
  if (speakerOn.value) {
    callStore.speakerOff(activeSessionId.value);
  } else {
    callStore.speakerOn(activeSessionId.value);
  }
  speakerOn.value = !speakerOn.value;
};
const triggerDialPad = () => {
  openKeyPadModal();
};
const transferPromtIsOpen = ref(false);
const triggerTransfer = () => {
  const callStore = useCallStore();
  if (isReadyForTransfer.value && callStore.activeReferalCallId) {
    callReferal();
    isReadyForTransfer.value = false;
    return;
  }
  transferPromtIsOpen.value = true;
  isReadyForTransfer.value = false;
};
const closeTransformPromt = () => {
  // isHold.value = true;
  requestAnimationFrame(() => {
    transferPromtIsOpen.value = false;
  });
};
const openCallPadModal = async () => {
  const modal = await modalController.create({
    component: BaseCallPad,
  });
  requestAnimationFrame(() => {
    modal.present();
  });
  const { data, role } = await modal.onWillDismiss();
  if (role == 'confirm') {
    isReadyForTransfer.value = true;
    transferPromtIsOpen.value = false;
    const callStore = useCallStore();
    targetUserPhoneNumberForTransfer.value = {
      phoneNumber: data.contact_phone,
      type: 'nava_out',
    };
    callStore.holdTheCall(activeSessionId.value);
    callStore.makingCallByAnotherUserForAskingTransfer(
      data.contact_phone,
      'nava_out',
    );

    // here is a callback when numbers pad will be closed
  }
  if (role == 'cancel') {
    transferPromtIsOpen.value = false;
  }
};

const openContactsInTransformModal = async () => {
  const modal = await modalController.create({
    component: ContactsInTransformModal,
  });
  requestAnimationFrame(() => {
    modal.present();
  });
  const { data, role } = await modal.onWillDismiss();
  if (role == 'cancel') {
    isHold.value = true;
    isReadyForTransfer.value = false;
    transferPromtIsOpen.value = false;

    // here is a callback when numbers pad will be closed
  }
  if (role == 'confirm') {
    isReadyForTransfer.value = true;
    targetUserPhoneNumberForTransfer.value = {
      phoneNumber: data.contact_phone,
      type: 'free_call',
    };
    const callStore = useCallStore();
    callStore.holdTheCall(activeSessionId.value);
    setTimeout(() => {
      callStore.makingCallByAnotherUserForAskingTransfer(
        targetUserPhoneNumberForTransfer.value.phoneNumber,
        'free_call',
      );
    }, 0);

    /// here should get user profile
    transferPromtIsOpen.value = false;
    // here is a callback when numbers pad will be closed
  }
};

// open modal for numbers pad during call
const openKeyPadModal = async () => {
  const modal = await modalController.create({
    component: KeyPadOnDuringCallModal,
  });
  requestAnimationFrame(() => {
    modal.present();
  });
  const { data, role } = await modal.onWillDismiss();
  if (role === 'cancel') {
    // here is a callback when numbers pad will be closed
  }
};

const triggerButtons = (value) => {
  if (
    (!connectionInformation.value.isInConversation ||
      !inComponentAcceptCallState.value) &&
    !connectionInformation.value.isOutgoing
  )
    return;
  buttonsInHideState.value = value;
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
.sensor-icon-container {
  position: absolute;
  left: 5vw;
  top: 5vw;
  display: block;
}
.avatar-container {
  width: 100%;
  height: 100%;
}
.avatar {
  max-height: calc(400px - 10vh);
  max-width: calc(400px - 10vh);
  min-width: calc(10vw);
  min-height: calc(10vw);
  width: 50vw;
  height: 50vw;
  position: relative;
  overflow: hidden;
}
.user-image {
  max-height: calc(400px - 10vh);
  max-width: calc(400px - 10vh);
  min-width: calc(10vw);
  min-height: calc(10vw);
  width: 45vw;
  height: 45vw;
  left: 2.5vw;
  top: 2.5vw;
  border-radius: 50%;
  position: absolute;
  object-fit: cover;
  opacity: 0;
  transform: scale(0.5);
  transition: 0.5s ease-in-out;
}
.user-image-show {
  opacity: 1;
  transform: scale(1);
}
.font-size-18 {
  font-size: 18px;
}
.font-size-16 {
  font-size: 16px;
}
.mt-10 {
  margin-top: 10px;
}
.flex-container {
  display: flex;
  gap: 5px;
}
.font-farsi .flex-container {
  direction: rtl;
}
.calling-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: calc(20px - 0.5vh);
  margin: 0 auto;
  padding: calc(20px - 1vh);
  padding-top: calc(30px - 3vh);
  max-width: 430px;
  transition: 0.3s;
  opacity: 1;
  transform: scale(1);
}
.option-button {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: calc(72px - 3vmin);
  height: calc(72px - 3vmin);
  background-color: #ffffff;
  font-size: 16px;
  color: #333;
  border-radius: 20px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.active-icon {
  outline: 5px solid #3880ff;
}
.padd-icon {
  width: 45%;
  height: 45%;
}
.button-text {
  margin-top: 7px;
  font-size: 12px;
}
.disapper-button {
  opacity: 0;
  cursor: unset;
  transform: scale(0);
  pointer-events: none;
}
.action-buttons {
  max-width: 320px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  transition: 0.3s;
  margin-bottom: 5px;
}
.end-call-button {
  width: calc(82px - 1vh);
  min-height: calc(82px - 1vh);
  background-color: #f81d1d;
  border-radius: 100%;
  transition: 0.3s;
  transform: translateX(0) scale(1) rotate(-90deg);
  transform-origin: center;
}
.accept-call-button {
  background-color: #06c754;
  transform: scale(1);
  transition: 0.3s;
}
.accept-call-button:active {
  background-color: #06c754;
  transform: scale(0.9);
}
.end-call-button-during-calling:active {
  transform: scale(0.9) translateX(calc(-170% - 2vh)) rotate(0deg);
}
.end-call-button-during-ringing:active {
  transform: scale(0.9) translateX(0%) rotate(0deg);
}
.move-to-center {
  transform: translateX(calc(-150% - 2vh)) scale(1) rotate(140deg);
}
.fade-out {
  opacity: 0;
  transform: scale(0);
}
.md .option-button {
  border-radius: 10px;
}

.show-buttons-in-hide-state {
  background-color: white;
  color: black;
  height: 80px;
  font-size: 20px;
  display: block;
  width: 100%;
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  transform: translateY(100%);
}
.arrow-show-buttons-icon {
  transform: translateY(3px) rotate(180deg);
  transition: 0.5s;
}
.arrow-show-buttons-icon.show {
  transform: translateY(3px) rotate(0deg);
}
.slide-up {
  transform: translateY(0%);
}
</style>
