<template>
  <div class="stickers-modal-container" :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
    <coreHeader width="100%" height="10vh">
      <template #headerContent>
        <div class="modal-content">
          <img
            src="/Images/tabs/arrow-left.svg"
            alt="ion"
            v-if="locale == 'en'"
            @click="modalController.dismiss()"
          />
          <img
            src="/Images/tabs/arrow-right.svg"
            alt="ion"
            v-if="locale == 'fa'"
            @click="modalController.dismiss()"
          />
          <span class="header-title">
            {{ $t('tabs.profile.sticker.headertitle') }}
          </span>
        </div>
      </template>
    </coreHeader>

    <div class="modal-container">
      <div class="suggest-stickers-container">
        <div class="title-container">
          <span>
            {{ $t('tabs.profile.sticker.suggeststicker') }}
          </span>
        </div>
        <div class="btn-container">
          <button @click="openAllStickerModal">
            {{ $t('tabs.profile.sticker.view') }}
          </button>
        </div>
      </div>
      <span class="my-sticker" v-if="userStickersDataSource.length == 0">
        {{ $t('tabs.profile.sticker.notsticker') }}
      </span>
      <span class="my-sticker" v-else :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
        {{ $t('tabs.profile.sticker.mysticker') }}
      </span>
      <myStickersCard
        v-for="sticker in userStickersDataSource"
        :key="sticker.id"
        :id="sticker.id"
        :name="sticker.name"
        :count="sticker.number"
        :stickers="sticker.stickers[0]"
      />
    </div>
  </div>
</template>

<script setup>
import { useStickersStore } from '@/store/stickers/stickers.js';
import allStickersAndroid from '@/components/profile/modals/stickers/allStickers.vue';
import myStickersCard from '@/components/profile/myStickersCard.vue';
import { useI18n } from 'vue-i18n';
import coreHeader from '@/components/desktop/coreHeader.vue';
import { computed, onBeforeMount } from 'vue';
import { modalController, isPlatform } from '@ionic/vue';
const { locale } = useI18n();
const stickersStore = useStickersStore();

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const isAndroid = computed(() => {
  return isPlatform('android');
});

const userStickersDataSource = computed(() => {
  return stickersStore.userStickers;
});

const openAllStickerModal = async () => {
  const modal = await modalController.create({
    component: isAndroid.value ? allStickersAndroid : allStickersAndroid,
    breakpoints: [0, 1, 1, 1],
    initialBreakpoint: '0.5',
  });

  modal.present();
  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
  }
};

onBeforeMount(async () => {
  if (stickersStore.allStickers.length == 0) {
    await stickersStore.getAllStickers();
  }
  if (stickersStore.userStickers.length == 0) {
    await stickersStore.getAllUserStickers();
  }
});
</script>

<style scoped>
.modal-content {
  height: 68px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}
.header-title {
  color: #fff;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 0 10px;
}

.modal-container {
  width: 100%;
  height: 90vh;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}

.modal-container .my-sticker {
  color: #0066ff;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 15px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.suggest-stickers-container {
  width: 100%;
  display: flex;
  padding: 10px 15px;
}
.suggest-stickers-container .title-container {
  width: 60%;
  display: flex;
  text-align: right;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.suggest-stickers-container .btn-container {
  width: 40%;
  display: flex;
  justify-content: end;
}

.btn-container button {
  width: 98px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 5px;
  color: #fff;
  background: #428cff;
  font-size: 14px;
  font-weight: 600;
}
</style>
