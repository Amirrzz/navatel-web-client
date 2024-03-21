<template>
  <div class="sticker-card fade-animation">
    <coreSkeltonLoading v-if="skeltonLoading" width="60px" height="55px" />
    <img v-else :src="sticker" alt="image" @click="openInformationModal()" />

    <div class="info" @click="openInformationModal">
      <span class="title">{{ name }}</span>
      <span class="count"
        >{{ count }} {{ $t('tabs.profile.sticker.sticker') }}</span
      >
    </div>
    <div class="options">
      <ion-icon
        :icon="ellipsisVertical"
        size="small"
        @click="changeDropDownStatus"
      >
      </ion-icon>
      <div
        class="drop-down-container"
        v-if="dropDownStatus"
        @click="changeDropDownStatus"
      >
        <div
          class="drop-down-content"
          :class="{
            'dark-bg': getCurrentThemeIsDark,
            'light-bg': !getCurrentThemeIsDark,
          }"
          :style="{
            top: ` ${dropDownPosition.y}`,
            left: `${dropDownPosition.x}`,
          }"
        >
          <div class="item" @click.stop.prevent="deleteHandler">
            <img src="/Images/tabs/delete-gray.svg" alt="icon" />
            <span>
              {{ $t('tabs.profile.sticker.deletesticker') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <stickerInformation v-if="stickerInformationModalStatus" />
  </div>
</template>

<script setup>
import coreSkeltonLoading from '@/components/coreSkeltonLoading/index.vue';
import stickerInformation from '@/components/profile/modals/stickers/stickerInformation.vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { useStickersStore } from '@/store/stickers/stickers.js';
import { useUserStore } from '@/store/user/user.js';
import { useThemeStore } from '@/store/theme.js';
import { computed, ref, onMounted } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager';
import { useI18n } from 'vue-i18n';
import { IonIcon } from '@ionic/vue';
import { ellipsisVertical } from 'ionicons/icons';
const { t, locale } = useI18n();

const fileManagerStore = useFileManagerStore();
const stickersStore = useStickersStore();
const themeStore = useThemeStore();
const nestedModals = useNestedModals();
const userStore = useUserStore();
const sticker = ref('');
const dropDownPosition = ref({
  x: '0',
  y: '0',
});

const getCurrentThemeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const lang = computed(() => {
  return locale.value;
});

const skeltonLoading = computed(() => {
  return stickersStore.myStickerSkeltonLoading;
});

const dropDownStatus = ref(false);
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

const changeDropDownStatus = (event) => {
  dropDownStatus.value = !dropDownStatus.value;
  if (lang.value == 'en') {
    dropDownPosition.value.x = `${180}px`;
  } else {
    dropDownPosition.value.x = `${30}px`;
  }
  dropDownPosition.value.y = `${event.y}px`;
};

const stickerInformationModalStatus = computed(() => {
  return nestedModals.stickerInformation;
});

const openInformationModal = async () => {
  stickersStore.changeSkeltonLoadingStatus(true);
  nestedModals.openStickerInformationModal();
  await stickersStore.setSingleSticker(props.id);
  stickersStore.changeSkeltonLoadingStatus(false);
};

const deleteHandler = async () => {
  await stickersStore.deleteStickerForUser(props.id);
  setTimeout(() => {
    nestedModals.closeStickerInformationModal();
  }, 100);
};

onMounted(async () => {
  stickersStore.changeMyStickerSkeltonLoadingStatus(true);
  const blobFile = await fileManagerStore.handlerForSticker(
    props.stickers.file_id,
  );
  sticker.value = blobFile.filePath;
  stickersStore.changeMyStickerSkeltonLoadingStatus(false);
});
</script>

<style scoped>
.dark-bg {
  background: #191919;
}
.light-bg {
  background: #fff;
}
.skelton-loading {
  width: 50px;
}
.sticker-card {
  width: 100%;
  display: flex;
  padding: 0 15px;
  margin-top: 5px;
}

.sticker-card img {
  width: 70px;
  height: 70px;
}

.sticker-card .info {
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
}

.sticker-card .title {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.sticker-card .count {
  font-size: 16px;
  font-style: normal;
  padding-top: 5px;
  font-weight: 500;
  color: #8f8888;
  line-height: normal;
}

.sticker-card .options {
  width: 40%;
  display: flex;
  justify-content: end;
  align-items: center;
  position: relative;
}

.options .drop-down-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff00;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drop-down-content {
  width: 180px;
  padding: 5px 5px;
  border-radius: 5px;
  position: absolute;
  z-index: 1;
}

.drop-down-container .item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 10px;
  animation: 0.2s open-animation;
}

.item img {
  width: 20px;
  height: 20px;
}

.item span {
  font-size: 20;
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
