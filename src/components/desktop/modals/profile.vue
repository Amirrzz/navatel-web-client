<template>
  <div class="profile-modal-container" @click="closeProfileModal">
    <div class="profile-modal">
      <coreHeader width="100%" height="85px">
        <template #headerContent>
          <div class="header">
            <div class="upload-file-container">
              <img src="/Images/tabs/add-photo-gray.svg" alt="icon" />
            </div>
            <div class="info">
              <span class="name"> {{ userStore.nickname }} </span>
              <span class="status"> Online </span>
            </div>
          </div>
        </template>
      </coreHeader>

      <div class="information">
        <span class="title"> {{ $t('desktop.profile.account') }} </span>
        <span class="text">
          {{ userStore.phoneNumber }}
        </span>
        <span class="text"> {{ userStore.nickname }} </span>
        <span class="subtext"> {{ $t('desktop.profile.username') }} </span>
        <span class="text">...</span>
        <span class="subtext"> {{ $t('desktop.profile.bio') }} </span>
      </div>

      <div class="options-container" :class="{ 'option-dark': themeIsDark }">
        <div class="option">
          <img src="/Images/tabs/setting-gray.svg" alt="icon" />
          <span> {{ $t('desktop.profile.setting') }} </span>
        </div>
        <div class="option">
          <img src="/Images/tabs/wallet-gray.svg" alt="icon" />
          <span> {{ $t('desktop.profile.wallet') }} </span>
        </div>
        <div class="option">
          <img src="/Images/tabs/save-message-gray.svg" alt="icon" />
          <span> {{ $t('desktop.profile.savemessage') }} </span>
        </div>
        <div class="option">
          <img src="/Images/tabs/sticker-gray.svg" alt="icon" />
          <span> {{ $t('desktop.profile.stickers') }} </span>
        </div>
        <div class="option">
          <img src="/Images/tabs/support-gray.svg" alt="icon" />
          <span> {{ $t('desktop.profile.support') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/store/theme.js';
import { useUserStore } from '@/store/user/user.js';
import { computed } from 'vue';

import coreHeader from '../coreHeader.vue';

const nestedModalsDesktop = useNestedModalsDesktop();
const themeStore = useThemeStore();

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const userStore = useUserStore();
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

const closeProfileModal = () => {
  nestedModalsDesktop.profile = false;
};

const avatar = computed(() => {
  return userStore.nickname.slice(0, 1);
});
</script>

<style scoped>
@keyframes bg-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-animation {
  0% {
    margin-top: 800px;
  }
  100% {
    margin-top: 0;
  }
}
.profile-modal-container {
  position: fixed;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00000095;
  animation: 0.3 bg-animation;
}

.profile-modal {
  border-radius: 10px;
  overflow: hidden;
  width: 400px;
  background: #fff;
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  animation: 0.4s modal-animation;
}

.profile-modal-dark {
  background: #303030;
  border: none;
}

.profile-modal .header {
  height: 85px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.upload-file-container {
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.upload-file-container img {
  width: 26px;
}

.info {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.info .name {
  font-size: 19px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.info .status {
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.information {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  border-bottom: 5px solid #d9d9d9;
  color: #101010;
}

.information .title {
  color: #06f;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.information .subtext {
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: #bebebe;
}

.information .text {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-top: 15px;
}

.options-container {
  display: flex;
  flex-direction: column;
  padding: 0px 15px;
  padding-bottom: 15px;
  color: #101010;
}

.options-container .option {
  display: flex;
  cursor: pointer;
  margin-top: 25px;
}

.options-container .option img {
  width: 20px;
}

.options-container .option span {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 8px;
}

.option-dark {
  color: #fff;
}
</style>
