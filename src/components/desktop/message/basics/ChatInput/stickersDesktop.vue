<template>
  <div class="stickers-container">
    <div class="sticker-header-container">
      <coreSkeltonLoading
        v-if="headerLoading"
        v-for="i in userStickers.length"
        width="35px"
        height="35px"
        style="margin: 0 5px"
      />
      <img
        v-else
        class="fade-animation"
        style="width: 35px; height: auto; margin: 0 5px; cursor: pointer"
        v-for="sticker in headerStickersURL"
        :src="sticker.url"
        alt="sticker"
        @click="setSticker(sticker.id)"
      />
    </div>
    <div class="stciker-content">
      <coreSkeltonLoading
        v-if="contentLoading"
        v-for="i in 12"
        width="70px"
        height="70px"
        style="margin: 5px 10px"
      />
      <img
        v-else
        class="stciker fade-animation"
        v-for="sticker in selectedSticker.stickers"
        :key="sticker.id"
        :src="sticker.url"
        alt="sticker"
        @click="handleSendSticker(sticker)"
      />
    </div>
  </div>
</template>

<script setup>
import coreSkeltonLoading from '@/components/coreSkeltonLoading/index.vue';

import { useThemeStore } from '@/store/theme.js';
import { useUserStore } from '@/store/user/user.js';
import { getFile } from '@/helpers/parser.js';
import { computed, onMounted, ref, defineEmits } from 'vue';
import { useStickersStore } from '@/store/stickers/stickers.js';

const emit = defineEmits(['onSelectSticker']);

const themeStore = useThemeStore();
const stickersStore = useStickersStore();
const userStore = useUserStore();
const headerStickersFileId = ref([]);
const headerStickersURL = ref([]);
const headerLoading = ref(false);
const contentLoading = ref(false);

const getCurrentThemeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const userStickers = computed(() => {
  return stickersStore.userStickers;
});

const selectedSticker = computed(() => {
  return stickersStore.singleSticker;
});

const setSticker = async (id) => {
  contentLoading.value = true;
  await stickersStore.setSingleSticker(id);
  contentLoading.value = false;
};

const handleSendSticker = async (sticker) => {
  emit('sendSticker', sticker);
};

onMounted(async () => {
  headerLoading.value = true;
  await stickersStore.getAllUserStickers();
  userStickers.value.forEach((sticker) => {
    const result = { fileId: sticker.stickers[0].file_id, id: sticker.id };
    headerStickersFileId.value.push(result);
  });
  for (let i of headerStickersFileId.value) {
    const blobFile = await getFile(
      i.fileId,
      userStore.token,
      'image',
      'https://navaphone.com/cellar/api/v1',
    );
    const result = { url: blobFile.filePath, id: i.id };
    headerStickersURL.value.push(result);
  }
  headerLoading.value = false;
  setSticker(headerStickersURL.value[0].id);
});
</script>

<style scoped>
.stickers-container {
  width: calc(100% - 460px);
  display: flex;
  flex-direction: column;
  background: red;
}

.sticker-header-container {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background: yellow;
}

.stciker-content {
  width: 100%;
  height: 250px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  overflow-x: scroll;
  background: red;
}

.stciker-content .stciker {
  width: 70px;
  height: 70px;
  margin: 5px 10px;
  padding: 2px 2px;
  border-radius: 10px;
  transform: 0.5s;
  cursor: pointer;
}

.stciker:hover {
  background: #959595a8;
}

.dark-bg-tab {
  background: #000000;
}
</style>
