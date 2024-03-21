<template>
  <div class="calling-container video-calling">
    <div class="user-section">
      <div>
        <ion-text class="text-white ellipsis-2-line">
          <h1>{{ callerInformation.name }}</h1>
        </ion-text>
        <ion-text class="text-white font-size-18">
          ({{ t('tabs.callpad.videocall') }})
        </ion-text>
        <div class="font-size-16 mt-10">
          <div class="flex-container text-white">
            <img src="/Images/Logo-White.png" alt="Navatel-Logo" width="30" />
            <ion-text class="text-white font-size-18">
              {{ t('tabs.callpad.enterpriseDid') }}
            </ion-text>
          </div>
        </div>
      </div>
      <div class="avatar">
        <ion-icon
          icon="/Images/tabs/call-pad/calling/avatar.svg"
          class="avatar-container"
        />
      </div>
    </div>

    <div>
      <div class="ion-text-center">
        <ion-icon
          icon="/Images/tabs/call-pad/calling/mic-off.svg"
          class="md-icon"
          :class="micOn ? 'fade-in-up' : 'fade-out-down'"
        />
      </div>
      <div class="ion-text-center">
        <ion-icon
          icon="/Images/tabs/call-pad/calling/videocall-off.svg"
          class="md-icon mt-40"
          :class="videoOn ? 'fade-in-up' : 'fade-out-down'"
        />
      </div>
    </div>

    <div class="action-buttons">
      <button
        class="end-call-button ion-activatable ripple-parent"
        @click="endCall"
      >
        <ion-icon icon="/Images/tabs/call-pad/phone.svg" class="padd-icon" />
        <ion-ripple-effect></ion-ripple-effect>
      </button>
      <button
        class="small-button ion-activatable ripple-parent"
        :class="{ 'active-icon': !micOn }"
        @click="triggerMic"
      >
        <ion-icon
          :icon="
            micOn
              ? '/Images/tabs/call-pad/calling/mic.svg'
              : '/Images/tabs/call-pad/calling/mic-off.svg'
          "
          class="flip-icon"
          :class="{ flipped: !micOn }"
        />
      </button>
      <button
        class="small-button ion-activatable ripple-parent"
        :class="{ 'active-icon': !videoOn }"
        @click="triggerCamera"
      >
        <ion-icon
          :icon="
            videoOn
              ? '/Images/tabs/call-pad/calling/videocall.svg'
              : '/Images/tabs/call-pad/calling/videocall-off.svg'
          "
          class="flip-icon"
          :class="{ flipped: !videoOn }"
        />
        <ion-ripple-effect></ion-ripple-effect>
      </button>
      <button
        class="accept-call-button ion-activatable ripple-parent"
        @click="acceptCall"
      >
        <ion-icon icon="/Images/tabs/call-pad/phone.svg" class="padd-icon" />
        <ion-ripple-effect></ion-ripple-effect>
      </button>
    </div>
  </div>
</template>
<script setup>
import { IonText, IonIcon, IonRippleEffect } from '@ionic/vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVideoCallStore } from '@/store/videoCall/videoCall.js';
const { t } = useI18n();
const videoCallStore = useVideoCallStore();

const callerInformation = computed(() => {
  return videoCallStore.callerInformation;
});

const micOn = ref(true);
const videoOn = ref(false);
const acceptCall = () => {
  videoCallStore.answeredVideoCall(micOn, videoOn);
};
const endCall = async () => {
  videoCallStore.closeVideoCallModal();
};

const triggerMic = () => {
  micOn.value = !micOn.value;
};

const triggerCamera = () => {
  videoOn.value = !videoOn.value;
};
</script>
<style scoped>
.video-calling {
  background-color: #4d545f !important;
  justify-content: space-around;
}
.user-section {
  display: flex;
  justify-content: space-between;
}
.font-farsi .user-section,
.font-farsi .action-buttons {
  direction: rtl;
  text-align: right;
}
.avatar-container {
  width: 80%;
  height: 80%;
}
.avatar {
  max-height: calc(400px - 10vh);
  max-width: calc(400px - 10vh);
  min-width: calc(10vw);
  min-height: calc(10vw);
  width: 40vw;
  height: 40vw;
  overflow: hidden;
  display: flex;
  justify-content: end;
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
.mt-40 {
  margin-top: 40px;
}
.flex-container {
  display: flex;
  align-items: center;
  gap: 5px;
}
.font-farsi .flex-container {
  direction: rtl;
}
.padd-icon {
  width: 45%;
  height: 45%;
}
.full-icon {
  width: 65%;
  height: 65%;
}
.md-icon {
  width: 45px;
  height: 45px;
}
.action-buttons {
  max-width: 320px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  transition: 0.3s;
  margin-bottom: 5px;
  align-items: center;
}
.action-buttons button {
  border-radius: 100%;
  transition: 0.3s;
  transform-origin: center;
  width: calc(82px - 1vh);
  height: calc(82px - 1vh);
}
.end-call-button {
  background-color: #e53935;
  transform: translateX(0) scale(1) rotate(135deg);
}
.accept-call-button {
  background-color: #99cc33;
  transform: scale(1);
}
.accept-call-button:active {
  background-color: #06c754;
  transform: scale(0.9);
}
.small-button {
  width: calc(60px - 1vh) !important;
  height: calc(60px - 1vh) !important;
  background-color: #b4b4b4;
}
.active-icon {
  background-color: #3279e5;
  transform: scaleX(-1);
}
.flip-icon {
  width: 65%;
  height: 65%;
  transition: transform 0.5s;
}
.flipped {
  transform: scaleX(-1);
}
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-out-down {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
</style>
