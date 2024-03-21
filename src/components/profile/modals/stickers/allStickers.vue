<template>
  <div class="all-sticker-modal-container">
    <!-- <div class="loading-container" v-if="loading">
      <ion-spinner name="crescent"></ion-spinner>
      <span>
        {{ $t('tabs.profile.sticker.loading') }}
      </span>
    </div> -->
    <allStickerCard
      v-for="sticker in stickersDataSource"
      :key="sticker.id"
      :id="sticker.id"
      :name="sticker.name"
      :count="sticker.number"
      :stickers="sticker.stickers"
    />
  </div>
</template>

<script setup>
import { useStickersStore } from '@/store/stickers/stickers.js';
import { computed } from 'vue';

const stickersStore = useStickersStore();
import allStickerCard from '../../allStickerCard.vue';

const stickersDataSource = computed(() => {
  return stickersStore.getStickers;
});

const loading = computed(() => {
  return stickersStore.loading;
});
</script>

<style scoped>
.all-sticker-modal-container {
  width: 100%;
  height: 90vh;
  overflow-y: scroll;
}

.loading-container {
  width: 100%;
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-container span {
  font-size: 16px;
  font-weight: 600;
  padding-top: 10px;
}
</style>
