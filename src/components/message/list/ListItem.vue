<template>
  <div class="chat-row-container">
    <ion-text
      class="avatar"
      :class="[
        computedItemData.avatarClass,
        { 'avatar-me-message': item.isMySelf },
      ]"
    >
      <IonIcon
        :icon="bookmarkOutline"
        size="large"
        v-if="item.isMySelf"
        color="white"
        class="bookmark-itsMySelft"
      ></IonIcon>
      <div v-if="!item.isMySelf">{{ getFirstChar }}</div>
      <img
        v-if="!item.isMySelf && gettingImage"
        class="avatar-image"
        :src="gettingImage"
        @load="imageProfileLoaded"
      />
      <slot name="checkmark"></slot>
    </ion-text>
    <div class="content option-item-border">
      <div class="user-information">
        <div
          v-if="!item.isMySelf"
          class="user-information-title ellipsis-text"
          :class="[
            {
              'text-direction-right': computedItemData.textDirectionIsRight,
              'text-direction-left':
                computedItemData.textDirectionIsRight == false,
            },
          ]"
        >
          {{ computedItemData.name }}
        </div>
        <div v-if="item.isMySelf" class="saved-massages-item">
          {{ t('tabs.message.savedMessages') }}
        </div>

        <div class="message-content last-message-text" v-if="useInMessageTab">
          <span class="checker" v-if="detectSenderMessage && detectTypeMessage">
            <IonIcon
              color="primary"
              :icon="checkmarkDone"
              size="small"
              v-if="item.lastSeenData.isSeen"
            ></IonIcon>
            <IonIcon
              :icon="checkmark"
              size="small"
              v-else
              color="primary"
            ></IonIcon>
          </span>
          <div
            class="ellipsis-text"
            :class="[
              {
                'text-direction-right':
                  item.lastMessageData?.textDirectionIsRight,
                'text-direction-left':
                  item.lastMessageData?.textDirectionIsRight == false,
              },
            ]"
          >
            {{ item.lastMessageData.content }}
          </div>
        </div>
      </div>
      <div class="badge-time-container" v-if="useInMessageTab">
        <div>
          <span class="time" v-if="getFormatedDate.isYesterday">
            {{ t('tabs.contacts.yesterday') }}&nbsp;{{
              getFormatedDate.value
            }}</span
          >
          <span class="time" v-else> {{ getFormatedDate }}</span>
        </div>
        <div class="badge-container">
          <div
            v-if="item.badge"
            class="badge-item"
            :class="[item.chatIsMute ? 'badge-gray' : 'badge-blue']"
          >
            {{ item.badge }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from '@/store/user/user';
import { IonText, IonIcon } from '@ionic/vue';
import { checkmark, checkmarkDone, bookmarkOutline } from 'ionicons/icons';
import { computed, onMounted, defineProps, defineEmits, nextTick } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { dateFormatterHandler } from '@/helpers/dateAndTimeFormatter.js';
import { useLocaleStore } from '@/store/locale.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  item: {
    type: Object,
  },
  useInMessageTab: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['getUserProfile', 'getGroupInformation']);

const getFormatedDate = computed(() => {
  const localeStore = useLocaleStore();
  const localeFormat = localeStore.getLocaleFormat;
  let dateString = props.item.date;
  if (dateString.toString().includes('UTC')) {
    const parts = dateString.split(' ');
    const datePart = parts[0];
    const timePart = parts[1].substring(0, 8);
    const fullDateString = `${datePart}T${timePart}Z`;
    // Create a Date object using the combined date string
    dateString = new Date(fullDateString).toString();
  }
  return dateFormatterHandler(dateString, localeFormat, {
    isFromMessages: true,
    isFromCallHistory: false,
  });
});

const detectSenderMessage = computed(() => {
  const userStore = useUserStore();
  if (props.item.groupData) {
    if (props.item.lastMessageInfo.from == userStore.userId) {
      return true;
    } else {
      return false;
    }
  } else {
    return props.item.isFromMe && !props.item.isMySelf;
  }
});

const detectTypeMessage = computed(() => {
  const mtype = props.item.lastMessageInfo.mtype;
  switch (mtype) {
    case 'grp.crt':
      return false;
      break;
    case 'grp.cfg.tit':
      return false;
      break;
    case 'grp.add':
      return false;
      break;
    case 'grp.rmv':
      return false;
      break;
    case 'grp.adm.add':
      return false;
      break;
    case 'grp.adm.rmv':
      return false;
      break;
    case 'grp.jnd':
      return false;
      break;
    case 'grp.lft':
      return false;
      break;
    case 'grp.avt':
      return false;
      break;
    default:
      return true;
      break;
  }
});

const getFirstChar = computed(() => {
  return computedItemData.value.name ? computedItemData.value.name[0] : '';
});
const gettingImage = computed(() => {
  const avatarFileId = props.item.information.avatarFileId;
  const fileManagerStore = useFileManagerStore();
  const image = fileManagerStore.usersAvatarBlobList[avatarFileId];
  if (image && image.thumbnailFile) {
    return image.thumbnailFile;
  }
  return false;
});

const computedItemData = computed(() => {
  if (props.item.groupData) return props.item.groupData;
  return {
    avatarClass: props.item.information.avatarClass,
    name: props.item.information.name,
  };
});

onMounted(() => {
  nextTick(() => {
    if (
      !props.item.groupData &&
      !props.item.isMySelf
    ) {
      emit('getUserProfile', props.item);
    } else if (props.item.groupData) {
      emit('getGroupInformation', props.item);
    }
  });
});
</script>

<style scoped>
.chat-row-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  direction: ltr;
}
.font-farsi .chat-row-container {
  direction: rtl;
}

.content {
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 20px;
  font-weight: 600;
  height: 100%;
  width: 100%;
}
.saved-massages-item {
  font-size: 18px;
}
.message-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}
.bookmark-itsMySelft {
  position: absolute;
  top: 12.5%;
  left: 12.5%;
  width: 75%;
  height: 75%;
  opacity: 1;
  transition: 1s;
}
.avatar {
  font-size: 32px;
  height: 50px;
  width: 50px;
  min-width: 50px;
  min-height: 50px;
  border-radius: 50%;
  text-align: center;
  color: white;
  position: relative;
  margin: 0 3vmin;
}
.avatar-me-message {
  background-color: var(--ion-color-primary);
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
.user-information {
  max-width: calc(100vw - 200px);
}
.user-information-title {
  font-size: calc(20px - 0.5vw);
  font-weight: 700;
  min-height: 28px;
}
.last-message-text {
  font-size: calc(14px - 0.5vw);
  font-weight: 400;
}

.ellipsis-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.font-farsi .user-information-title,
.font-farsi .last-message-text {
  text-align: right;
}
.time {
  font-size: calc(12px - 0.5w);
  color: #92949c;
  min-height: 20px;
}
.badge-time-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  font-size: calc(13px - 0.5vw);
  height: 100%;
  width: 96px;
  margin: 0 3vmin;
}
.time {
  min-height: 20px;
  text-align: end;
  width: 100%;
}
.badge-container {
  height: 20px;
  width: 20px;
}
.badge-item {
  border-radius: 50%;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
.badge-blue {
  background-color: #428cff;
}
.badge-gray {
  background-color: #989aa2;
}
.option-item-border {
  border-bottom: 1px solid #92949c91;
}
</style>
