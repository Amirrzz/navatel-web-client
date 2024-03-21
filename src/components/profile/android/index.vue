<template>
  <div class="information-part Andriod">
    <div class="header" :style="headerComputed">
      <label for="inputFileInProfileAndroid1">
        <ion-icon
          icon="Images/tabs/profile/add_a_photo.svg"
          class="d animated"
          :class="[headerAddIconClass]"
        ></ion-icon>
      </label>
      <input
        type="file"
        hidden
        id="inputFileInProfileAndroid1"
        @change="onFileChange"
        accept=".jpg, .jpeg, .png, .gif, .bmp, .tiff"
      />
    </div>
    <div
      class="constent-image"
      :class="{
        'constent-image-shadow': setImageShadow,
        [userData.avatarBackColor]: true,
      }"
      :style="[
        { backgroundImage: `url(${getAnyExistImage})` },
        imageComputedPosition,
      ]"
    >
      <img
        :src="getAnyExistImage"
        alt=""
        @load="imageLoaded"
        v-if="!imageIsLoaded"
      />
      <div
        class="constent-image-after"
        v-if="!imageProfile && !userData.avatar"
      >
        {{ getFirstChar }}
      </div>
      <div
        class="overlay"
        :class="{ 'radius-50': scrollValue > 150 }"
        v-if="imageUploadingData.imageProfileInProfileTab"
        :style="computedOpacityForUploadingStyle"
      ></div>
      <div
        class="percentage"
        v-if="imageUploadingData.imageProfileInProfileTab"
      >
        <span>{{
          imageUploadingData.imageProfileInProfileTab.percentage
        }}</span>
        <span>%</span>
      </div>
      <input
        type="file"
        hidden
        id="inputFileInProfileAndroid2"
        @change="onFileChange"
        accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff"
      />
      <label for="inputFileInProfileAndroid2" v-show="!noImageExist">
        <ion-icon
          :style="addIconComputed"
          icon="Images/tabs/profile/add_a_photo.svg"
          class="d"
        ></ion-icon>
      </label>
    </div>
    <div class="user-info" :style="usernameAndStatus">
      <div
        class="user-info-name"
        :class="{ 'text-direction-right': getUsernameTextDirection }"
      >
        {{ userData.nickname || t('tabs.profile.noName') }}
      </div>
      <div class="user-info-status">{{ userData.status }}</div>
    </div>
    <div
      class="options-part"
      :class="{
        'margin-top-100vw': getAnyExistImage && !noImageExist,
        'margin-profile-page-without-image': noImageExist,
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
  </div>
</template>
<script setup>
import { IonIcon, IonText } from '@ionic/vue';
import { useUserStore } from '@/store/user/user.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useObjectUrl } from '@vueuse/core';
import { useErrorStore } from '@/store/errors.js';
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  defineProps,
  defineEmits,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { detectTextDirection } from '@/helpers/textFormatter.js';
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
});

const emit = defineEmits(['updateBioModal']);
const emitOpenModalToParent = () => {
  emit('updateBioModal');
};
const fileManagerStore = useFileManagerStore();

const imageProfile = ref(false);
const imageUploadingData = ref({});

const scrollValue = ref(0);

const addIconComputed = computed(() => {
  if (scrollValue.value > 150) {
    return {
      display: 'none',
    };
  }
});
const headerComputed = computed(() => {
  const height = 105 - scrollValue.value / 5;
  const selectedHeight = Math.min(50, height);
  return {
    height: selectedHeight + 'vw',
  };
});
const defaultHeightImagePosition = ref(0);
const imageComputedPosition = computed(() => {
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
  if (noImageExist.value) {
    return {
      height: defaultHeightImagePosition.value + 'vw',
      width: '70vw',
      transition: '0.1s',
      transform: `translate(-25%,-10%) scale(0.3)`,
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

const getFirstChar = computed(() => {
  const nickname = props.userData.nickname;
  return nickname[0] + '' + nickname[1];
});
const xPosForUsername = ref();
const yPosForUsername = ref();
const usernameAndStatus = computed(() => {
  if (scrollValue.value < 149 && !noImageExist.value) {
    yPosForUsername.value = scrollValue.value;
    return {
      transform: `translate(${0},-${yPosForUsername.value}px)`,
    };
  }
  if (scrollValue.value >= 150 && scrollValue.value < 300) {
    yPosForUsername.value = 65;
    xPosForUsername.value = 30;
    return {
      transform: `translate(${xPosForUsername.value}vw, -${yPosForUsername.value}vw)`,
    };
  }
  if (scrollValue.value >= 300) {
    yPosForUsername.value = scrollValue.value / 12;
    const y = yPosForUsername.value + 47;
    const calcY = Math.min(y, 85);
    return {
      transform: `translate(${xPosForUsername.value}vw, -${calcY}vw)`,
    };
  }
  if (noImageExist.value) {
    yPosForUsername.value = 65;
    xPosForUsername.value = 30;
    return {
      transform: `translate(${xPosForUsername.value}vw, -${yPosForUsername.value}vw)`,
    };
  }

  return {
    transform: `translate(${xPosForUsername.value},${yPosForUsername.value})`,
  };
});
const getUsernameTextDirection = computed(() => {
  return detectTextDirection(props.userData.nickname)?.isRightToLeft;
});
function setScroller() {
  const page = document.querySelector(
    '.profile-tab-container ion-content.main-content',
  );
  if (!page) {
    setScroller();
    return;
  }
  page.addEventListener('ion-scroll', handleScroll);
}

function handleScroll(event) {
  scrollValue.value = event.detail.scrollTop;
}

const onFileChange = (event) => {
  const userStore = useUserStore();
  const inputFile = event.target.files[0];
  if (inputFile) {
    const file = shallowRef();
    file.value = event.target.files[0];
    imageProfile.value = useObjectUrl(file).value;
    fileManagerStore
      .uploadFile(inputFile, 'imageProfileInProfileTab', imageUploadingData)
      .then((result) => {
        userStore
          .setUserProfile({
            avatar: result,
            nickname: userStore.nickname,
            phone_number: userStore.phoneNumber,
            username: userStore.userId,
          })
          .then((e) => {})
          .catch((e) => {
            const userStore = useUserStore();
            imageUploadingData.value = {};
            imageProfile.value = userStore.avatar;
            const errorStore = useErrorStore();
            errorStore.setErrors();
          });
      })
      .then((e) => {})
      .catch(() => {
        const userStore = useUserStore();
        imageUploadingData.value = {};
        imageProfile.value = userStore.avatar;
        const errorStore = useErrorStore();
        errorStore.setErrors();
      });
  }
};
const computedOpacityForUploadingStyle = computed(() => {
  return {
    opacity:
      1 - imageUploadingData.value.imageProfileInProfileTab.percentage / 100,
  };
});
////////////////////computeds
const setImageShadow = computed(() => {
  const value =
    scrollValue.value < 100 && getAnyExistImage.value && !noImageExist.value;
  return value;
});
const imageIsLoaded = ref(false);
const imageLoaded = () => {
  imageIsLoaded.value = true;
};
const noImageExist = computed(() => {
  return (
    (!imageProfile.value && !props.userData.avatar) || !imageIsLoaded.value
  );
});
const getAnyExistImage = computed(() => {
  return imageProfile.value || props.userData.avatar;
});
const headerAddIconClass = computed(() => {
  return scrollValue.value >= 400 ? 'add-photo-fadeout' : 'add-photo-fadein';
});
watch(props, () => {
  if (!props.userData.avatar) {
    imageProfile.value = null;
  }
});
onMounted(() => {
  setTimeout(() => {
    defaultHeightImagePosition.value = 70;
    yPosForUsername.value = 0;
    xPosForUsername.value = 0;
  }, 0);
  requestAnimationFrame(() => {
    setScroller();
  });
});
onBeforeUnmount(() => {
  imageProfile.value = null;
  document
    .querySelector('.profile-tab-container ion-content.main-content')
    ?.removeEventListener('ion-scroll', handleScroll);
});
</script>
<style scoped>
ion-icon.d {
  position: absolute;
  right: 10vw;
  bottom: 0;
  height: 45px;
  width: 45px;
  padding: 10px;
  border-radius: 50%;
  background-color: var(--ion-color-light);
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
  font-size: calc(75px - 1vw);
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
.user-info-container {
  max-height: 100vw;
  max-width: 100vw;
  background: rgba(206, 255, 196, 0.644);
  width: 73vw;
  height: 100%;
  top: -30vw;
  left: 0;
  position: fixed;
  z-index: 17;
}
.user-info {
  position: fixed;
  color: white;
  top: 92vw;
  left: 5vw;
  transition: 0.1s;
  transition-timing-function: ease-out;
  font-size: 20px;
  z-index: 20;
  width: 50vw;
}

.user-info-name {
  font-size: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  direction: ltr;
}

.user-info-status {
  font-size: 12px;
}
.user-info-medium {
  transform: translate(35vw, -30vw);
}
</style>
