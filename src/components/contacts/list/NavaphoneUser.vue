<template>
  <div class="contact-container" :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
    <ion-text class="avatar" :class="[item.avatarClass]"
      >{{ item.firstChar }}
      <img
        v-if="gettingImage"
        class="avatar-image"
        :src="gettingImage"
        @load="imageProfileLoaded"
      />
      <slot name="checkmark"></slot>
    </ion-text>
    <div class="content">
      <div class="user-information">
        <div
          class="user-information-title"
          :class="[
            {
              'text-direction-right': item?.textDirectionIsRight,
              'text-direction-left': item?.textDirectionIsRight == false,
            },
          ]"
        >
          {{ item.name }}
        </div>
        <div class="time" v-if="showLastSeen">
          <span v-if="item.lastSeen">
            <span v-if="item.lastSeen.isYesterday">
              {{ t('tabs.contacts.lastSeen') }}&nbsp;{{
                t('tabs.contacts.yesterday')
              }}&nbsp;{{ item.lastSeen.value }}</span
            >
            <span v-else-if="item.lastSeen">
              {{ t('tabs.contacts.lastSeen', { time: item.lastSeen }) }}</span
            >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonText } from '@ionic/vue';
import { computed, onMounted, defineProps, defineEmits, ref } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
const props = defineProps({
  item: {
    type: Object,
  },
  showLastSeen: {
    type: Boolean,
    default: true,
  },
});

const gettingImage = computed(() => {
  const avatarFileId = props.item.avatarFileId;
  const fileManagerStore = useFileManagerStore();
  const image = fileManagerStore.usersAvatarBlobList[avatarFileId];
  if (image && image.thumbnailFile) {
    return image.thumbnailFile;
  }
  return false;
});

const emit = defineEmits(['getAddionalProfileInfo']);

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

onMounted(() => {
  emit('getAddionalProfileInfo', props.item);
});
</script>
<style scoped>
.contact-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  padding: 0px 0;
}
.avatar {
  font-size: 32px;
  min-width: 50px;
  min-height: 50px;
  max-width: 70px;
  max-height: 70px;
  border-radius: 50%;
  text-align: center;
  color: white;
  position: relative;
}
.avatar-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  transition: 1s;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-image-loaded {
  opacity: 1;
}
.avatar-image-loaded-without-anim {
  opacity: 1;
}
.user-information-title {
  direction: ltr;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 72vw;
}
.font-farsi .user-information-title {
  text-align: right;
}
.time {
  font-size: 12px;
  color: var(--ion-color-medium);
  min-height: 20px;
}
</style>
