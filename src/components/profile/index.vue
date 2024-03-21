<template>
  <IonPage class="profile-tab-container">
    <ion-header>
      <ion-toolbar color="transparent">
        <ion-buttons :slot="languageIsEnglish ? 'end' : 'start'">
          <ion-icon
            :icon="ellipsisVertical"
            size="large"
            id="open-popver-setting-profile"
            :color="isAndroid ? 'light' : 'primary'"
            @click="popoverOpen = true"
          >
          </ion-icon>
          <ion-popover
            trigger="open-popver-setting-profile"
            :arrow="false"
            :is-open="popoverOpen"
          >
            <ion-content class="ion-padding">
              <div class="menu-options android" v-if="isAndroid">
                <div class="option-item" @click="openUsernameModal">
                  <div class="option-item-logo">
                    <ion-icon icon="/Images/tabs/profile/edit.svg"></ion-icon>
                  </div>
                  <div class="option-item-title">
                    {{ t('tabs.profile.options.editName') }}
                  </div>
                </div>
                <div class="option-item">
                  <div class="option-item-logo">
                    <ion-icon
                      icon="/Images/tabs/profile/add_a_photo.svg"
                    ></ion-icon>
                  </div>
                  <div class="option-item-title">
                    {{ t('tabs.profile.options.takePhoto') }}
                  </div>
                </div>
                <div class="option-item" @click="removeAvatar">
                  <div class="option-item-logo">
                    <ion-icon icon="/Images/tabs/profile/delete.svg"></ion-icon>
                  </div>
                  <div class="option-item-title">
                    {{ t('tabs.profile.options.deletePhoto') }}
                  </div>
                </div>
              </div>
              <div class="menu-options ios" v-if="!isAndroid">
                <div class="option-item" @click="logoutUser">
                  <div class="option-item-logo">
                    <ion-icon icon="/Images/tabs/profile/logout.svg"></ion-icon>
                  </div>
                  <div class="option-item-title">
                    {{ t('tabs.profile.logout.title') }}
                  </div>
                </div>
              </div>
            </ion-content>
          </ion-popover>
        </ion-buttons>
        <ion-buttons
          :slot="languageIsEnglish ? 'start' : 'end'"
          @click="backPageHandler"
        >
          <ion-icon
            :icon="arrowBack"
            size="large"
            :color="isAndroid ? 'light' : 'primary'"
            :class="languageIsEnglish ? '' : 'fa-back'"
          >
          </ion-icon>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :scroll-events="isAndroid" class="main-content">
      <ion-refresher :pull-min="300" slot="fixed" @ionRefresh="refreshPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <AndriodHeader
        v-if="isAndroid && getUserData"
        :userData="{
          avatar: gettingImage,
          nickname: getUserData.nickname,
          phoneNumber: getUserData.phoneNumber,
          getFirstChars: getUserData.getFirstChars,
          bio: getUserData.bio,
          avatarBackColor: getUserData.avatarBackColor,
        }"
        :title="t('tabs.profile.account')"
        @updateBioModal="openBioModal"
      ></AndriodHeader>
      <IosHeader
        v-else-if="getUserData"
        :userData="{
          avatar: gettingImage,
          nickname: getUserData.nickname,
          phoneNumber: getUserData.phoneNumber,
          getFirstChars: getUserData.getFirstChars,
          bio: getUserData.bio,
          avatarBackColor: getUserData.avatarBackColor,
        }"
        @updateBioModal="openBioModal"
      ></IosHeader>
      <div class="options-part">
        <div class="option-item" @click="openSettingModal">
          <div class="option-item-logo">
            <ion-icon icon="/Images/tabs/profile/settings.svg"></ion-icon>
          </div>
          <div class="option-item-title">
            {{ t('tabs.profile.setting.title') }}
          </div>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item" @click="openWalletModal">
          <div class="option-item-logo">
            <ion-icon icon="/Images/tabs/profile/wallet.svg"></ion-icon>
          </div>
          <div class="option-item-title">
            {{ t('tabs.profile.wallet.title') }}
          </div>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item">
          <div class="option-item-logo">
            <ion-icon icon="/Images/tabs/profile/notes.svg"></ion-icon>
          </div>
          <div class="option-item-title">
            {{ t('tabs.profile.savedMessage.title') }}
          </div>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item">
          <div class="option-item-logo">
            <ion-icon icon="/Images/tabs/profile/sticker.svg"></ion-icon>
          </div>
          <div class="option-item-title" @click="openStickersModal">
            {{ t('tabs.profile.stickers.title') }}
          </div>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item" @click="openSupportChatModal">
          <div class="option-item-logo">
            <ion-icon icon="/Images/tabs/profile/support.svg"></ion-icon>
          </div>
          <div class="option-item-title">
            {{ t('tabs.profile.support.title') }}
          </div>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item" v-if="isAndroid" @click="logoutUser">
          <div class="option-item-logo">
            <ion-icon icon="/Images/tabs/profile/logout.svg"></ion-icon>
          </div>
          <div class="option-item-title">
            {{ t('tabs.profile.logout.title') }}
          </div>
        </div>
      </div>
      <div class="fake-height"></div>
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
  IonPopover,
  modalController,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import { ellipsisVertical, arrowBack } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user/user.js';

import AndriodHeader from '@/components/profile/android/index.vue';
import IosHeader from '@/components/profile/ios/index.vue';
import BioModalAndroid from '@/components/profile/modals/bio/android.vue';
import BioModalIos from '@/components/profile/modals/bio/ios.vue';
import UsernameModal from '@/components/profile/modals/username/android.vue';
import SettingModal from '@/components/profile/modals/settings/index.vue';
import WalletModal from '@/components/profile/modals/wallet/index.vue';
import stickerModalAndroid from '@/components/profile/modals/stickers/index.vue';
import { useErrorStore } from '@/store/errors.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useI18n } from 'vue-i18n';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useOtoStore } from '@/store/chats/otoChat.js';
import OTOChatModal from '@/components/message/OTO/index.vue';
import { getLastMessage } from '@/api/OTO/index.js';

import { userReseterStore } from '@/store/reset.js';

const { t, locale } = useI18n();
const router = useRouter();

const isAndroid = computed(() => {
  return isPlatform('android');
});
const getUserData = computed(() => {
  return useUserStore();
});
const gettingImage = computed(() => {
  const fileManagerStore = useFileManagerStore();
  const image =
    fileManagerStore.usersAvatarBlobList[getUserData.value.avatarFileId];
  if (image && image.mainFile) {
    return image.mainFile;
  }
  return false;
});
const languageIsEnglish = computed(() => locale.value == 'en');

const backPageHandler = () => {
  modalController.dismiss(false, 'cancel');
};
const refreshPage = () => {
  location.reload();
};
const popoverOpen = ref(false);
const closePopover = () => {
  popoverOpen.value = false;
};
const logoutUser = () => {
  closePopover();
  modalController.dismiss(false, 'logout');
  router.push('/auth/start');
  const reseterStore = userReseterStore();
  reseterStore.resetAllStores().then(() => {
    location.reload();
  });
};
const openBioModal = async () => {
  const modal = await modalController.create({
    component: isAndroid.value ? BioModalAndroid : BioModalIos,
  });

  modal.present();
  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    // here should handel end call [process
  }
};

const openStickersModal = async () => {
  const modal = await modalController.create({
    component: isAndroid.value ? stickerModalAndroid : stickerModalAndroid,
  });

  modal.present();
  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    // here should handel end call [process
  }
};

const openSettingModal = async () => {
  const modal = await modalController.create({
    component: SettingModal,
  });

  modal.present();
};

const openWalletModal = async () => {
  const modal = await modalController.create({
    component: WalletModal,
  });

  modal.present();
  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    // here should handel end call [process
  }
};

const openUsernameModal = async () => {
  closePopover();
  const modal = await modalController.create({
    component: UsernameModal,
  });

  modal.present();
  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    // here should handel end call [process
  }
};
const removeAvatar = () => {
  closePopover();
  const userStore = useUserStore();
  userStore.avatar = null;
  userStore
    .setUserProfile({
      avatar: null,
      nickname: userStore.nickname,
      phone_number: userStore.phoneNumber,
      username: userStore.userId,
    })
    .then(() => {
      const userStore = useUserStore();
      userStore.avatar = false;
      userStore.avatarFileId = false;
    })
    .catch(() => {
      userStore.avatar = false;
      userStore.avatarFileId = false;
      const errorStore = useErrorStore();
      errorStore.setErrors();
    });
};
const openSupportChatModal = async () => {
  const contactStore = useContactsStore();
  const supportChatData = contactStore.supportInfomation;
  const lastSeenId = await prepardLastSeenId(supportChatData.chatId);
  const chatData = {
    chatId: supportChatData.chatId,
    information: {
      name: supportChatData.information.name,
      phoneNumber: supportChatData.information.phoneNumber,
      avatarClass: supportChatData.information.avatarClass,
    },
    lastMessageData: {
      guid: lastSeenId,
    },
    lastSeenData: {
      guid: lastSeenId,
    },
  };
  openOTOChatRoomModal(chatData);
};
const prepardLastSeenId = (chatId) => {
  return new Promise((resolve) => {
    const overallStore = useOverallChatsStore();
    const chatItem = overallStore.chatsList.find(
      (item) => item.chatId == chatId,
    );
    if (chatItem) {
      if (chatItem.lastSeenData && chatItem.lastSeenData.guid) {
        resolve(chatItem.lastSeenData.guid);
      } else if (chatItem.lastMessageInfo && chatItem.lastMessageInfo.data) {
        resolve(chatItem.lastMessageInfo.data.guid);
      }
    } else {
      getLastMessage(chatId, 1).then((result) => {
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
const openOTOChatRoomModal = async (chatItem) => {
  const otoStore = useOtoStore();
  otoStore.currentChatId = chatItem.chatId;
  const modal = await modalController.create({
    component: OTOChatModal,
    componentProps: {
      chatData: chatItem,
    },
  });
  setTimeout(() => {
    requestAnimationFrame(async () => {
      modal.present();
    });
  }, 0);
};
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
ion-popover {
  --offset-x: -15px;
  --offset-y: -30px;
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
.font-farsi .menu-options {
  direction: rtl;
}
ion-title {
  font-size: 32px;
}
ion-content ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
}
.font-farsi .options-part {
  direction: rtl;
}
.options-part {
  margin-bottom: 100vmin;
}
.ios .options-part {
  border: 1px solid #92949c91;
  margin: 0 10px;
  margin-bottom: 20px;
  border-radius: 15px;
}
.options-part {
  padding-right: 10px;
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
.fa-back {
  transform: rotate(180deg);
}
.fake-height {
  height: 10vh;
}
</style>
