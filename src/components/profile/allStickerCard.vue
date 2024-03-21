<template>
  <div
    class="all-sticker-card fade-animation"
    :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
  >
    <div class="info-container">
      <span class="title"> {{ name }} </span>
      <span class="count">
        {{ count }} {{ $t('tabs.profile.sticker.sticker') }}
      </span>
      <div class="images-container">
        <div class="skelton-loading" v-for="sticker in 3" v-if="skeltonLoading">
          <coreSkeltonLoading width="60px" height="55px" />
        </div>
        <img
          v-else
          v-for="sticker in stickers"
          :src="sticker.blob"
          alt="image"
          @click="openInformationModal()"
        />
      </div>
    </div>

    <div class="btn-container">
      <button @click="handleAddStickerForUser">
        {{ $t('tabs.profile.sticker.add') }}
      </button>
    </div>
    
  </div>
</template>

<script setup>
import coreSkeltonLoading from '@/components/coreSkeltonLoading/index.vue';
import { getFile } from '@/helpers/parser.js';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref } from 'vue';
import { useStickersStore } from '@/store/stickers/stickers.js';
import { useUserStore } from '@/store/user/user.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager';

const fileManagerStore = useFileManagerStore();
const stickers = ref([]);
const stickersStore = useStickersStore();

const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    default: '',
  },
  count: {
    type: Number,
    default: 0,
  },
  stickers: {
    type: Array,
    default: [],
  },
});

const skeltonLoading = computed(() => {
  return stickersStore.skeltonLoading;
});

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const handleAddStickerForUser = () => {
  stickersStore.addStickerForUser(props.id);
};
const { locale } = useI18n();

onMounted(async () => {
  stickersStore.changeSkeltonLoadingStatus(true);
  const blobs = [];
  for (let i of props.stickers) {
    const blobfile = await fileManagerStore.handlerForSticker(i.file_id);
    const result = { blob: blobfile.filePath };
    blobs.push(result);
  }
  stickers.value = blobs.slice(0, 3);
  stickersStore.changeSkeltonLoadingStatus(false);
});

</script>

<style scoped>
.skelton-loading {
  margin: 5px 10px;
}
.all-sticker-card {
  width: 100%;
  display: flex;
  padding: 15px 15px;
}

.all-sticker-card .info-container {
  width: 65%;
  display: flex;
  flex-direction: column;
}

.info-container .title {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.info-container .count {
  font-size: 16px;
  font-style: normal;
  padding-top: 5px;
  font-weight: 500;
  color: #8f8888;
  line-height: normal;
}

.info-container .images-container {
  width: 70%;
  display: flex;
}

.images-container img {
  width: 70px;
  height: 70px;
}

.btn-container {
  width: 35%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-container button {
  width: 98px;
  height: 37px;
  flex-shrink: 0;
  border-radius: 5px;
  color: #fff;
  background: #428cff;
  margin-top: 70px;
}
</style>
