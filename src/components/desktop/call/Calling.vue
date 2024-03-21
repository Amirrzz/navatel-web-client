<template>
  <div
    class="modal-container load-animation"
    :class="{ 'full-screen': fullScreen, 'division-state': !fullScreen }"
  >
    <img
      @click="minimizeScreenHandler"
      src="/Images/tabs/minimize-call-screen.svg"
      alt="icon"
      class="minimize-button"
    />
    <div class="call-content">
      <div
        class="calling-container slid-up-animation load-animation"
        @click.self="triggerButtons(true)"
      >
        <ion-icon
          :icon="radioOutline"
          size="large"
          class="sensor-icon-container fade-in-animation"
          v-if="connectionInformation.isInConversation"
          :color="
            connectionInformation.isReallyConnected ? 'success' : 'danger'
          "
        ></ion-icon>
        <ion-text class="text-white ellipsis-2-line"> </ion-text>

        <!-- ** call header section name and phone number ** -->
        <div class="font-size-24 mt-60" style="padding: 20px 0">
          <div
            class="text-white information-content"
            v-if="
              connectionInformation.callState && !inComponentAcceptCallState
            "
          >
            <span v-if="connectionInformation.targetUserInformation.name">
              {{ connectionInformation.targetUserInformation.name }}
            </span>
            <span v-else>
              {{ connectionInformation.targetUserInformation.phoneNumber }}
            </span>
            <DurationDuringCall
              v-if="connectionInformation.isInConversation"
              :sessionId="connectionInformation.callId"
              :isOutGoing="connectionInformation.isOutgoing"
            ></DurationDuringCall>
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
          <div
            v-if="inComponentAcceptCallState"
            class="flex-container text-white"
          >
            {{ t(`tabs.callpad.` + connectionInformation.callState) }}
            <DurationDuringCall
              :sessionId="connectionInformation.callId"
            ></DurationDuringCall>
          </div>
        </div>
        <!-- ** call header section name and phone number ** -->

        <!-- ** call avatar section part ** -->
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
        <!-- ** call avatar section part ** -->

        <!-- ** call options section part ** -->
        <div class="calling-options" v-if="connectionInformation.showKeys">
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
        <!-- ** call options section part ** -->

        <!-- ** call footer section part end call butoon and answer button call ** -->
        <div class="action-buttons" @click.self="triggerButtons(true)">
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
        </div>
        <!-- ** call footer section part end call butoon and answer button call ** -->
        <KeyPadModal
          v-if="keyPadModalState"
          @close="keyPadModalState = false"
        />
        <ContactsInTransformModal
          v-if="contactsTransformState"
          @close="contactsTransformState = false"
        />
        <CallPadContent v-if="callPadState" @close="callPadState = false" />
        <TransferPromt
          v-if="transferPromtIsOpen"
          @close="closeTransformPromt"
          @openCallPad="openCallPadModal"
          @openContacts="openContactsInTransformModal"
          @didDismiss="closeTransformPromt"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonText, IonIcon, IonRippleEffect } from '@ionic/vue';
import { radioOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { ref, defineProps, computed } from 'vue';
import { useCallStore, triggerRingBackAudio } from '@/store/call/call';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

import KeyPadModal from '@/components/desktop/call/KeyPad.vue';
import TransferPromt from '@/components/desktop/call/Transfer/Promt.vue';
import CallPadContent from '@/components/desktop/call/Transfer/callPadContent.vue';
import ContactsInTransformModal from '@/components/desktop/call/Transfer/Contacts.vue';
import DurationDuringCall from '@/components/callpad/DurationDuringCall.vue';

const nestedModalsDesktop = useNestedModalsDesktop();
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

const fullScreen = computed(() => {
  return nestedModalsDesktop.fullScreenCall;
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

const callPadState = ref(false);
const keyPadModalState = ref(false);
const buttonsInHideState = ref(false);
const inComponentAcceptCallState = ref(false);
const micOn = ref(true);
const isHold = ref(false);
const speakerOn = ref(false);
const isReadyForTransfer = ref(false);
const targetUserPhoneNumberForTransfer = ref('');

const minimizeScreenHandler = () => {
  nestedModalsDesktop.fullScreenCall = !nestedModalsDesktop.fullScreenCall;
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

const closeTransformPromt = (event) => {
  // isHold.value = true;
  requestAnimationFrame(() => {
    transferPromtIsOpen.value = false;
  });
};

const openCallPadModal = async () => {
  callPadState.value = true;
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
};

const contactsTransformState = ref(false);
const openContactsInTransformModal = async () => {
  contactsTransformState.value = true;
  transferPromtIsOpen.value = false;
};

// open modal for numbers pad during call
const openKeyPadModal = async () => {
  keyPadModalState.value = true;
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
.call-content {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.minimize-button {
  cursor: pointer;
  width: 20px;
  height: 20px;
  top: 0;
  right: 0;
  position: relative;
  z-index: 1;
  margin: 20px 20px;
}
.full-screen {
  width: 100%;
}
.division-state {
  width: calc(100% - 380px);
}
.modal-container {
  position: fixed;
  z-index: 99999;
  left: 0;
  height: 100vh;
  display: flex;
  background: #4d545f;
  transition: 0.5s;
}

.load-animation {
  animation: 1s load-animation;
}

.information-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

@keyframes load-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.calling-container {
  width: 500px;
  height: 100vh;
}
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
  max-height: 200px;
  max-width: 200px;
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
.font-size-24 {
  font-size: 24px;
}
.font-size-18 {
  font-size: 18px;
}
.font-size-16 {
  font-size: 16px;
}
.mt-60 {
  margin-top: 60px;
}
.flex-container {
  display: flex;
  gap: 5px;
}
.font-farsi .flex-container {
  direction: rtl;
}
.calling-options {
  display: flex;
  justify-content: center;
  align-content: center;
  margin-top: 30px;
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
  margin: 0 10px;
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
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 30px 0;
}
.end-call-button {
  width: calc(67px - 1vh);
  min-height: calc(67px - 1vh);
  background-color: #f81d1d;
  border-radius: 100%;
  transition: 0.3s;
  transform-origin: center;
  margin: 20px;
}

.answer-call-button {
  width: calc(67px - 1vh);
  min-height: calc(67px - 1vh);
  background-color: #06c754;
  border-radius: 100%;
  transition: 0.3s;
  transform-origin: center;
  margin: 20px;
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
