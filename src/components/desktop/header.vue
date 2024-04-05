<template>
  <coreHeader width="100%" height="70px">
    <template #headerContent>
      <div class="header">
        <div class="user-info" @click="openProfileModal">
          <div class="avatar">
            {{ avatar }}
          </div>
          <span class="name">
            {{ userStore.nickname }}
          </span>
        </div>
        <div class="options" @click="openDropDown">
          <img
            src="/Images/tabs/more.svg"
            alt="icon"
            style="width: 5px; cursor: pointer"
          />
        </div>
        <div
          class="drop-down"
          :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
          v-if="dropDownStatus"
          :class="{
            'drop-down-rtl': rtlDesginHandler === true,
            'drop-down-ltr': rtlDesginHandler === false,
          }"
        >
          <div class="drop-down-item" @click="logoutUser">
            <span>
              {{ $t('desktop.logout') }}
            </span>
            <img
              src="/Images/tabs/logout-gray-fa.svg"
              alt="icon"
              style="width: 20px"
              v-if="rtlDesginHandler"
            />
            <img
              src="/Images/tabs/logout-gray-en.svg"
              alt="icon"
              style="width: 20px"
              v-else
            />
          </div>
        </div>
      </div>
    </template>
  </coreHeader>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useUserStore } from '@/store/user/user.js';
import { useRouter } from 'vue-router';
import { userReseterStore } from '@/store/reset.js';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

import coreHeader from './coreHeader.vue';

const { locale } = useI18n();
const Router = useRouter();
const userStore = useUserStore();
const dropDownStatus = ref(false);
const nestedModalsDesktop = useNestedModalsDesktop();

const avatar = computed(() => {
  return userStore.nickname.slice(0, 1);
});

const openDropDown = () => {
  dropDownStatus.value = !dropDownStatus.value;
};

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const openProfileModal = () => {
  nestedModalsDesktop.profile = true;
  // nestedModalsDesktop.groupChatRoom = false;
  // nestedModalsDesktop.coreModal = false;
};

const logoutUser = () => {
  Router.push('/auth/start');
  const reseterStore = userReseterStore();
  reseterStore.resetAllStores().then(() => {
    location.reload();
  });
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: 70px;
}

.user-info {
  width: 70%;
  height: 65px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #99bcf0;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
}

.name {
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 0 10px;
  color: #fff;
}

.options {
  width: 100px;
  height: 65px;
  display: flex;
  justify-content: end;
  align-items: center;
  position: relative;
  padding: 0 10px;
}

.drop-down {
  position: absolute;
  z-index: 1;
  background: #fff;
  color: #292929;
  border-radius: 10px;
  height: 40px;
  padding: 10px 15px;
  animation: 0.5s open-animation;
}

.drop-down-rtl {
  margin-right: 270px;
  position: absolute;
  z-index: 1;
}
.drop-down-ltr {
  margin-left: 250px;
  position: absolute;
  z-index: 1;
}

.drop-down-item {
  display: flex;
  cursor: pointer;
}

.drop-down-item span {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 5px;
}

@keyframes open-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
