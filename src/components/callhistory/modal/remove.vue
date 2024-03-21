<template>
  <div class="modal-container" @click="close">
    <div
      class="modal-content"
      :class="{
        'dark-mode-bg': getCurrentThemeIsDark,
        'light-mode-bg': !getCurrentThemeIsDark,
      }"
    >
      <img
        src="/Images/tabs/remove-blue.svg"
        alt="icon"
        style="width: 30px; height: 30px"
      />
      <span class="alert">{{ $t('tabs.callHistory.removeAlert') }}</span>
      <div class="accept-content">
        <span @click.stop="handleRemoveCalls">{{
          $t('tabs.callHistory.yes')
        }}</span>
        <span @click.stop="close" style="padding-top: 15px">{{
          $t('tabs.callHistory.no')
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '@/store/theme.js';
import { useCdrStore } from '@/store/callHistory/callHistory.js';

const cdrStore = useCdrStore();
const themeStore = useThemeStore();

const getCurrentThemeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const close = () => {
  cdrStore.removeModalStatus = false;
};

const handleRemoveCalls = async () => {
  await cdrStore.removeCallsFromHistory();
  cdrStore.removeModalStatus = false;
};
</script>

<style scoped>
.light-mode-bg {
  background-color: #fff;
}
.dark-mode-bg {
  background-color: #000;
}
.modal-container {
  width: 100%;
  height: 100dvh;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.656);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 1;
}

.modal-content {
  width: 90%;
  margin-bottom: 0px;
  animation: 0.5s open-animation;
  border-radius: 10px 10px 0 0;
  box-shadow: 0px 1px 1px 0px #cac7c7;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.modal-content .alert {
  font-size: 14px;
  font-weight: 700;
  padding-top: 20px;
}

.accept-content {
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
}

.accept-content span {
  font-size: 18px;
  font-weight: 700;
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
