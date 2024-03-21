<template>
  <div class="information-part ios">
    <div
      class="image-container"
      :class="{ [userData.avatarBackColor]: !userData.avatar }"
    >
      <img class="image" :src="userData.avatar" v-if="userData.avatar" />
      <div class="avatar" v-else>{{ userData.getFirstChars }}</div>
    </div>
    <div class="content">
      <div class="name">
        {{ userData.nickname || t('tabs.profile.noName') }}
      </div>
    </div>
    <div class="options">
      <div class="option-item" @click="emit('openChat')">
        <div class="icon loading-container">
          <img
            src="/Images/tabs/contacts/chat-ios.svg"
            alt="icon"
            v-if="!isOpeningChat"
          />
          <div class="loading" v-else><Loading></Loading></div>
        </div>
        <span class="option-item-text">
          {{ t('tabs.contacts.profile.message') }}
        </span>
      </div>
      <div class="option-item">
        <div class="icon">
          <img src="/Images/tabs/video-call-blue.svg" alt="icon" />
        </div>
        <span class="option-item-text">
          {{ t('tabs.contacts.profile.videocall') }}
        </span>
      </div>
      <div class="option-item" @click="makeCall">
        <div class="icon">
          <img src="/Images/tabs/call-blue.svg" alt="icon" />
        </div>
        <span class="option-item-text">
          {{ t('tabs.contacts.profile.call') }}
        </span>
      </div>
    </div>
    <div class="info-container" :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
      <div class="info">
        <span class="info-text">
          {{ userData.phoneNumber }}
        </span>
        <span class="info-name">
          {{ t('tabs.contacts.profile.phonenumber') }}
        </span>
        <div class="line"></div>
        <span class="info-text"> {{ userData.nickname }}</span>
        <span class="info-name">
          {{ t('tabs.contacts.profile.username') }}
        </span>
        <div class="line"></div>
        <span class="info-text"> {{ userData.bio }} </span>
        <span class="info-name">
          {{ t('tabs.contacts.profile.bio') }}
        </span>
      </div>
    </div>

    <!-- <div class="media-tabs-container">
      <mediaTabs />
    </div> -->
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, defineProps, defineEmits } from 'vue';
import { useCallStore } from '@/store/call/call.js';
import Loading from '@/components/message/basics/loading.vue';
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
  showAction: {
    type: Boolean,
    default: true,
  },
  isOpeningChat: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['updateBioModal', 'openChat']);

const { t, locale } = useI18n();
const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});
const makeCall = async () => {
  const callStore = useCallStore();
  callStore.makeFreeCall(props.userData.phoneNumber);
};
</script>
<style scoped>
ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
  min-width: 15px;
  min-height: 15px;
  padding-top: 1px;
}
.information-part {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.image-container {
  margin-top: 24px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: white;
  font-weight: bold;
  overflow: hidden;
  position: relative;
}
.image {
  opacity: 1;
  position: relative;
  z-index: 4;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-loaded {
  opacity: 1;
}
.avatar {
  position: absolute;
  z-index: 2;
  background-color: #0066ff80;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay {
  height: 100%;
  width: 100%;
  background: #464444;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.1s;
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
.content {
  margin: 24px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.name {
  font-size: 24px;
}
.last-seen {
  font-size: 16px;
  font-weight: 700;
  color: #aca6a6;
}
.bio {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.font-farsi .bio {
  direction: rtl;
}
.options {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option-item {
  margin: 0 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.option-item-text {
  color: #0066ff;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.option-item .icon {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 25px;
}

.info-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.info {
  border-radius: 20px;
  width: 90%;
  border: 1px solid #d8d2d2;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
}

.info-text {
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  min-height: 32px;
}

.info-name {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  color: #b8b3b3;
}

.info .line {
  width: 100%;
  height: 1px;
  background: #d8d2d2;
  margin-top: 2px;
}

.media-tabs-container {
  padding: 10px 100px;
}
.loading-container {
  position: relative;
}
.loading {
  position: absolute;
  left: 0;
  z-index: 1;
  top: 0;
  height: 100%;
  width: 100%;
}
.arrow-loading-container {
  background-color: unset;
}
</style>
