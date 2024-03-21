<template>
  <IonPage class="profile-tab-container">
    <ion-header>
      <ion-toolbar color="transparent">
        <ion-buttons slot="end">
          <ion-icon
            :icon="ellipsisVertical"
            size="large"
            :color="isAndroid ? 'light' : 'primary'"
          >
          </ion-icon>
        </ion-buttons>
        <ion-buttons slot="start" class="header-buttons">
          <ion-icon
            :icon="arrowBack"
            size="large"
            :color="isAndroid ? 'light' : 'primary'"
            @click.self="backPageHandler"
          >
          </ion-icon>
          <ion-icon
            :icon="call"
            size="large"
            v-if="isAndroid"
            :color="isAndroid ? 'light' : 'primary'"
            @click.self="makeCall"
          >
          </ion-icon>
          <ion-icon
            :icon="videocam"
            size="large"
            v-if="isAndroid"
            :color="isAndroid ? 'light' : 'primary'"
            @click.self="makeVideoCall"
          >
          </ion-icon>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :scroll-events="isAndroid" class="main-content-contacts">
      <div class="mt-10vh">
        <AndriodHeader
          v-if="isAndroid"
          :userData="{
            avatar: gettingImage,
            nickname: name,
            phoneNumber: phoneNumber,
            getFirstChars: getFirstChar,
            status: status,
            bio: bio,
            avatarBackColor: avatarBackColor,
          }"
          :title="t('tabs.contacts.profile.title')"
          :addIconPhoto="false"
          :isOpeningChat="isOpeningChat"
          @openChat="openOTOChatRoomModal"
        ></AndriodHeader>
        <IosHeader
          v-else
          :userData="{
            avatar: gettingImage,
            nickname: name,
            phoneNumber: phoneNumber,
            getFirstChars: getFirstChar,
            status: status,
            bio: bio,
            avatarBackColor: avatarBackColor,
          }"
          :showAction="false"
          :isOpeningChat="isOpeningChat"
          @openChat="openOTOChatRoomModal"
        />
      </div>
    </ion-content>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonButtons,
  isPlatform,
  modalController,
} from '@ionic/vue';
import { ellipsisVertical, arrowBack, call, videocam } from 'ionicons/icons';
import { ref, computed, defineProps, onMounted } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useLocaleStore } from '@/store/locale.js';

import { getStatus } from '@/api/status/index.js';
import { dateFormatterHandler } from '@/helpers/dateAndTimeFormatter.js';

import AndriodHeader from '@/components/contacts/profile/android/index.vue';
import IosHeader from '@/components/contacts/profile/ios/index.vue';
import OTOChatModal from '@/components/message/OTO/index.vue';

import { useI18n } from 'vue-i18n';
import { useCallStore } from '@/store/call/call.js';
import { getLastMessage } from '@/api/OTO/index.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useVideoCallStore } from '@/store/videoCall/videoCall';
import { textAvatar } from '@/helpers/textFormatter.js';

const { t } = useI18n();

const props = defineProps({
  userId: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
  },
  avatarFileId: {
    type: String,
  },
  avatarBackColor: {
    type: String,
  },
});

const isAndroid = computed(() => {
  return isPlatform('android');
});
const getFirstChar = computed(() => {
  return textAvatar(props.name);
});

const status = ref('');
const bio = ref('');
const backPageHandler = () => {
  modalController.dismiss(false, 'cancel');
};

const makeCall = async () => {
  const callStore = useCallStore();
  callStore.makeFreeCall(props.phoneNumber);
};
const makeVideoCall = () => {
  const videoCallStore = useVideoCallStore();
  videoCallStore.makeConferenceInOTO(props.userId);
};

const prepardLastSeenId = () => {
  return new Promise((resolve) => {
    const overallStore = useOverallChatsStore();
    const chatItem = overallStore.chatsList.find(
      (item) => item.chatId == props.userId,
    );
    if (chatItem) {
      if (chatItem.lastSeenData && chatItem.lastSeenData.guid) {
        resolve(chatItem.lastSeenData.guid);
      } else if (chatItem.lastMessageInfo && chatItem.lastMessageInfo.data) {
        resolve(chatItem.lastMessageInfo.data.guid);
      }
    } else {
      getLastMessage(props.userId, 1).then((result) => {
        if (result.length == 0) {
          resolve(null);
          return;
        }
        const lastMessage = result[0];
        const parsedBodyData = JSON.parse(lastMessage.body);
        const messageId = parsedBodyData.data.guid || null;
        resolve(messageId);
      });
    }
  });
};
const isOpeningChat = ref(false);
const openOTOChatRoomModal = async () => {
  if (isOpeningChat.value) return;
  isOpeningChat.value = true;
  const lastSeenMessageId = await prepardLastSeenId();
  const chatData = {
    chatId: props.userId,
    information: {
      avatarClass: props.avatarBackColor,
      name: props.name,
    },
    lastMessageData: {
      guid: lastSeenMessageId,
    },
    lastSeenData: {
      guid: lastSeenMessageId,
    },
  };
  requestAnimationFrame(async () => {
    const modal = await modalController.create({
      component: OTOChatModal,
      componentProps: {
        chatData,
      },
    });
    modal.present();
  });
  isOpeningChat.value = false;
};
const avatar = ref();
function checkImageProfile() {
  if (!props.avatar) return;
  const fileManagerStore = useFileManagerStore();
  const imageData = fileManagerStore.blobFilePathDownloadedList[props.userId];
  if (imageData.itsMain) return;
  fileManagerStore
    .handlerForGettingFile(imageData.fileId, 'image', false, props.userId)
    .then((data) => {
      avatar.value = data.filePath;
    });
}

const gettingImage = computed(() => {
  const fileManagerStore = useFileManagerStore();
  const image = fileManagerStore.usersAvatarBlobList[props.avatarFileId];
  if (image && image.mainFile) {
    return image.mainFile;
  }
  return false;
});

onMounted(() => {
  avatar.value = props.avatar;
  checkImageProfile();

  getStatus(props.userId).then((statusResult) => {
    const localeStore = useLocaleStore();
    const localeFormat = localeStore.getLocaleFormat;
    status.value = {
      text: statusResult.stat
        ? t('tabs.profile.online')
        : dateFormatterHandler(statusResult?.updated_at, localeFormat),
      isOnline: statusResult.stat,
    };
    bio.value = statusResult.presence;
  });
});
</script>
<style scoped>
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
  font-size: 32px;
  --border-width: 0 !important
;
}
ion-header {
  box-shadow: unset;
  direction: ltr;
}
ion-content {
  position: static;
}
ion-toolbar {
  direction: ltr !important;
  padding-left: 5px;
}
ion-header ion-icon {
  width: 30px;
  height: 30px;
}
.font-farsi ion-toolbar {
  direction: rtl;
}
ion-title {
  font-size: 32px;
}
.header-buttons {
  display: flex;
  gap: 20px;
}
ion-content ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
}
.font-farsi .options-part {
  direction: rtl;
}
.mt-10vh {
  margin-top: 10vh;
}
.options-part {
  margin-bottom: 100px;
  position: relative;
}
.ios .options-part {
  border: 1px solid #92949c91;
  margin: 0 10px;
  margin-bottom: 20px;
  padding-right: 10px;
  border-radius: 15px;
}
.option-item {
  display: flex;
  gap: 10px;
  font-size: 20px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.option-item-logo {
  width: 30px;
  height: 30px;
}
.option-item-logo svg {
  fill: #92949c91;
}
.option-item-title {
  width: 100%;
  padding-top: 15px;
  padding-bottom: 10px;
  font-weight: bold;
}
.option-item-border {
  height: 1px;
  width: calc(100% - 20px);
  border-bottom: 1px solid #92949c91;
  position: relative;
  margin-right: 20px;
}
</style>
