<template>
  <div class="information-part Andriod">
    <div class="header" :style="headerComputed">
      <ion-icon
        @click="emit('openChat')"
        icon="/Images/tabs/contacts/chat.svg"
        color="white"
        class="addPhoto animated add-photo-fadein"
        v-if="!userData.avatar"
      ></ion-icon>
      <ion-icon
        @click="emit('openChat')"
        icon="/Images/tabs/messages/loading-arrows.svg"
        color="white"
        class="addPhoto animated add-photo-fadein loading-icon"
        v-if="!userData.avatar && isOpeningChat"
      ></ion-icon>
    </div>
    <div
      class="constent-image"
      :class="{
        'constent-image-shadow': scrollValue < 100 && userData.avatar,
        [userData.avatarBackColor]: !userData.avatar,
      }"
      :style="[
        { backgroundImage: `url(${userData.avatar})` },
        imageComputedPosition,
      ]"
    >
      <div class="constent-image-after" v-if="!userData.avatar">
        {{ userData.nickname ? userData.nickname[0] : '' }}
      </div>

      <div
        class="user-info"
        :class="{ 'user-info-medium': scrollValue > 150 || !userData.avatar }"
      >
        <div class="user-info-name">
          {{ userData.nickname || t('tabs.profile.noName') }}
        </div>
      </div>
      <ion-icon
        @click="emit('openChat')"
        icon="/Images/tabs/contacts/chat.svg"
        color="white"
        class="addPhoto animated add-photo-fadein"
        v-if="userData.avatar"
      ></ion-icon>
      <ion-icon
        @click="emit('openChat')"
        icon="/Images/tabs/messages/loading-arrows.svg"
        color="white"
        class="addPhoto loading-icon"
        v-if="userData.avatar && isOpeningChat"
      ></ion-icon>
    </div>
    <div
      class="options-part"
      :class="{
        'margin-top-100vw': userData.avatar,
        'margin-profile-page-without-image': !userData.avatar,
      }"
    >
      <div class="option-item">
        <div class="option-item-logo"></div>
        <div class="option-item-title">
          <ion-text color="primary"> {{ title }}</ion-text>
        </div>
      </div>
      <div class="option-item">
        <div class="option-item-logo"></div>
        <div class="option-item-title">
          <div class="phone-number">{{ userData.phoneNumber }}</div>
        </div>
      </div>
      <div class="option-item-border"></div>
      <div class="option-item">
        <div class="option-item-logo"></div>
        <div class="option-item-title">
          <div class="name">
            {{ userData.nickname }} <sub>{{ t('tabs.profile.username') }}</sub>
          </div>
        </div>
      </div>
      <div class="option-item-border"></div>

      <div class="option-item" @click="emitOpenModalToParent">
        <div class="option-item-logo"></div>
        <div class="option-item-title">
          {{ userData.bio ? userData.bio : t('tabs.profile.bio') }}
          <sub>Bio</sub>
        </div>
      </div>
    </div>

    <div class="end-line"></div>
    <!-- <div class="media-tabs-container">
      <mediaTabs />
    </div> -->
  </div>
</template>
<script setup>
import { IonIcon, IonText } from '@ionic/vue';
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
} from 'vue';
import { useI18n } from 'vue-i18n';
import Loading from '@/components/message/basics/loading.vue';

const emit = defineEmits(['openChat']);

const { t } = useI18n();
const props = defineProps({
  userData: {
    type: Object,
    default: () => {
      return {
        avatar: '',
        nickname: '',
        phoneNumber: '',
        getFirstChars: '',
        status: '',
        bio: '',
        avatarBackColor: '',
      };
    },
  },
  addIconPhoto: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
  },
  isOpeningChat: {
    type: Boolean,
    default: true,
  },
});

const scrollValue = ref(0);

const headerComputed = computed(() => {
  if (!props.userData.avatar) {
    return {
      height: 50 + 'vw',
    };
  }
  const height = 105 - scrollValue.value / 5;
  const selectedHeight = Math.min(50, height);
  return {
    height: selectedHeight + 'vw',
  };
});
const imageComputedPosition = computed(() => {
  if (!props.userData.avatar) {
    return {
      height: '70vw',
      width: '70vw',
      transition: '0.1s',
      transform: 'translate(-25%,-10%) scale(0.3)',
    };
  }
  if (scrollValue.value > 300) {
    const scale = 0.5 - scrollValue.value / 1300;
    let x = -25 + (scrollValue.value - 300) / 10;
    let y = -20 - (scrollValue.value - 300) / 8;
    if (x > -13) x = -13;
    if (y < -35) y = -35;
    x = x + '%';
    y = y + '%';
    return {
      height: '70vw',
      width: '70vw',
      transition: '0.1s',
      transform: `translate(${x},${y}) scale(${Math.max(0.18, scale)})`,
    };
  }

  if (scrollValue.value > 150) {
    const scale = 0.55 - scrollValue.value / 1000;
    return {
      height: '70vw',
      width: '70vw',
      transition: '0.1s',
      transform: `translate(-25%,-10%) scale(${Math.max(0.3, scale)})`,
    };
  }

  const height = 100 - scrollValue.value / 5;
  return {
    height: height + 'vw',
    transform: 'translate(0%,0%) scale(1)',
    'border-radius': 0,
    transition: '0.1s',
    'font-size': '44px',
  };
});
function setScroller() {
  const container = document.querySelector(
    '.profile-tab-container ion-content.main-content-contacts',
  );
  if (!container) {
    setTimeout(() => {
      setScroller();
      return;
    }, 0);
  }
  container?.addEventListener('ion-scroll', handleScroll);
}

function handleScroll(event) {
  const scrollTop = event.detail.scrollTop;
  scrollValue.value = scrollTop;
}

onMounted(() => {
  setScroller();
});
onUnmounted(() => {
  const container = document.querySelector(
    '.profile-tab-container ion-content.main-content-contacts',
  );
  container?.removeEventListener('ion-scroll', handleScroll);
});
</script>
<style scoped>
ion-icon.addPhoto {
  position: absolute;
  right: 10vw;
  bottom: 0;
  height: 45px;
  width: 45px;
  padding: 10px;
  border-radius: 50%;
  background-color: var(--ion-color-white);
  z-index: 600;
  fill: var(--ion-color-medium);
  transform: translate(0, 50%);
}
.animated {
  animation-duration: 0.2s;
  animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  animation-fill-mode: both;
  animation-direction: normal;
}
.add-photo-fadein {
  animation-name: slideIn;
}
.add-photo-fadeout {
  animation-name: slideOut;
}
@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translate(0, 50%) scale(0);
  }
  100% {
    opacity: 1;
    transform: translate(0, 50%) scale(1);
  }
}
@keyframes slideOut {
  0% {
    opacity: 1;
    transform: translate(0, 50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(0, 50%) scale(0);
  }
}
.header-container {
  height: 20vw;
  background-color: var(--ion-color-primary);
  width: 100%;
}

.radius-50 {
  border-radius: 50%;
}
.overlay {
  height: 100%;
  width: 100%;
  background: #464444;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
  z-index: 5;
}
.percentage {
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5px;
  z-index: 6;
}
.helper-header {
  left: 0;
  top: 0;
  width: 100%;
  transition: 0.3s linear;
  height: 100vw;
  display: block;
  position: relative;
  z-index: 10;
}
.header {
  position: fixed;
  top: 0;
  z-index: 55;
  height: 100vw;
  width: 100vw;
  z-index: 9;
  background-color: var(--ion-color-primary);
  min-height: 20vw;
  z-index: 15;
}
.constent-image {
  height: 100vw;
  width: 100vw;
  z-index: 10;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  position: fixed;
  top: 0;
  z-index: 16;
}
.constent-image-after {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 98px;
  color: white;
}
.constent-image-shadow {
  -webkit-box-shadow: inset -9px -35px 50px -1px rgba(0, 0, 0, 0.71);
  box-shadow: inset -9px -35px 50px -1px rgba(0, 0, 0, 0.71);
}

.content {
  color: white;
}
.font-farsi .options-part {
  direction: rtl;
}

.options-part {
  z-index: 7;
  position: relative;
  margin-top: 40vw;
}
.margin-profile-page-without-image {
  margin-top: 60vw;
}
.margin-top-100vw {
  margin-top: 110vw;
}
.option-item {
  display: flex;
  gap: 10px;
  font-size: 20px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding-right: 10px;
}
.option-item-logo {
  width: 30px;
  height: 30px;
}
.option-item-logo svg {
  fill: #92949c91;
}
.option-item-title {
  width: 100%;
  padding-top: 15px;
  padding-bottom: 10px;
  font-weight: bold;
}
.option-item-title sub {
  display: block;
  color: #938d8d;
  font-size: 14px;
  margin-bottom: 8px;
}
.option-item-border {
  height: 1px;
  width: calc(100% - 20px);
  border-bottom: 1px solid #92949c91;
  position: relative;
  margin-right: 20px;
}
.end-line {
  height: 5px;
  width: 100%;
  background-color: #d9d9d9;
}

.user-info {
  position: absolute;
  bottom: 0;
  color: white;
  bottom: 5vw;
  left: 5vw;
  transition: 0.5s;
  transform: translate(0, 0) scale(1);
  width: 40%;
}
.user-info-name {
  font-size: 20px;
}
.user-info-status {
  font-size: 12px;
}
.user-info-medium {
  transform: translate(140vw, -20vw) scale(5);
}
.fake-height {
  height: 25vh;
}
.media-tabs-container {
  padding: 10px 10px;
}
.loading-icon {
  animation: 0.9s loading infinite linear;
}

@keyframes loading {
  0% {
    transform: translate(0, 50%) rotate(0deg);
  }
  100% {
    transform: translate(0, 50%) rotate(-360deg);
  }
}
</style>
