<style scoped>
.light-mode-bg {
  background-color: #fff;
}
.dark-mode-bg {
  background-color: #000;
}
.skelton-loading {
  margin: 5px 2px;
  width: 80px;
}
.sticker-information-container {
  width: 100%;
  height: 100dvh;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(238, 238, 238, 0.041);
  display: flex;
  justify-content: center;
  align-items: end;
  overflow: hidden;
}

.sticker-information-modal {
  width: 100%;
  height: 420px;
  margin-bottom: 0px;
  animation: 0.1s open-animation;
  border-radius: 10px 10px 0 0;
}

.sticker-information-modal .container {
  height: 365px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
}

.container .title {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.container .count {
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  color: #8f8888;
  line-height: normal;
  padding-top: 5px;
}

.container .images {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.images img {
  width: 75px;
  height: 75px;
  margin: 5px 5px;
}

.sticker-information-modal .bottom-bar {
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-bar span {
  color: #f00;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

@keyframes open-animation {
  0% {
    margin-bottom: -400px;
  }
  100% {
    margin-bottom: 0;
  }
}
</style>

<template>
  <div class="sticker-information-container" @click="close">
    <div
      class="sticker-information-modal"
      :class="{
        'dark-mode-bg': getCurrentThemeIsDark,
        'light-mode-bg': !getCurrentThemeIsDark,
      }"
    >
      <div class="container">
        <span class="title"> {{ singleStickerDataSource.name }} </span>
        <span class="count">
          {{ singleStickerDataSource.number }}
          {{ $t('tabs.profile.sticker.sticker') }}
        </span>
        <div class="images">
          <div
            class="skelton-loading"
            v-for="sticker in 50"
            v-if="skeltonLoading"
          >
            <coreSkeltonLoading width="70px" height="70px" />
          </div>
          <img
            v-else
            v-for="sticker in singleStickerDataSource.stickers"
            :src="sticker.url"
            alt="sticker"
          />
        </div>
      </div>
      <div class="bottom-bar" @click.stop="deleteHandler">
        <span> {{ $t('tabs.profile.sticker.delete') }} </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import coreSkeltonLoading from '@/components/coreSkeltonLoading/index.vue';
import { computed } from 'vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { useStickersStore } from '@/store/stickers/stickers.js';
import { useThemeStore } from '@/store/theme.js';

const nestedModals = useNestedModals();
const stickersStore = useStickersStore();
const themeStore = useThemeStore();

const getCurrentThemeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const skeltonLoading = computed(() => {
  return stickersStore.skeltonLoading;
});

const singleStickerDataSource = computed(() => {
  return stickersStore.singleSticker;
});

const close = () => {
  nestedModals.closeStickerInformationModal();
};

const deleteHandler = () => {
  stickersStore.deleteStickerForUser(singleStickerDataSource.value.id);
};
</script>
