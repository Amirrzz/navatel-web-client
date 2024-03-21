<template>
  <div class="profile-modal-container">
    <div class="profile-modal">
      <coreHeader width="100%" height="85px">
        <template #headerContent>
          <div class="header">
            <div class="info-container">
              <img
                :src="avatarUrl"
                alt="image"
                v-if="selectedContact.avatarFileId"
                class="contact-avatar"
              />
              <div
                class="avatar-circle"
                :class="[selectedContact.avatarClass]"
                v-else
              >
                {{ selectedContact.name[0] }}
              </div>
              <div class="info">
                <span class="name"> {{ contactName }} </span>
                <span class="status"> Online </span>
              </div>
            </div>
            <div class="close-container">
              <ion-icon
                :icon="close"
                style="color: #fff; font-size: 30px; cursor: pointer"
                @click="closeModal"
              ></ion-icon>
            </div>
          </div>
        </template>
      </coreHeader>
      <div class="content">
        <span class="account">{{ $t('desktop.account') }}</span>
        <div class="item-container">
          <div class="item-info">
            <span class="text">{{ selectedContact.contact_phone }}</span>
            <span class="title">{{ $t('desktop.phonenumber') }}</span>
          </div>
          <div class="item-icon">
            <img
              @click="openEditModal"
              src="/Images/tabs/pencil-gray.svg"
              alt="icon"
              class="edit-icon"
            />
          </div>
        </div>
        <div class="item-container">
          <div class="item-info">
            <span class="text">...</span>
            <span class="title">bio</span>
          </div>
        </div>
        <div class="item-container">
          <div class="item-info">
            <span class="text">{{ contactName }}</span>
            <span class="title">{{ $t('desktop.username') }}</span>
          </div>
          <div class="item-icon">
            <img
              @click="openEditModal"
              src="/Images/tabs/pencil-gray.svg"
              alt="icon"
              class="edit-icon"
            />
          </div>
        </div>
        <div class="line"></div>
        <div class="options">
          <div class="option" @click="openChatRoom">
            <img src="/Images/tabs/message-gray.svg" alt="icon" />
            <span>{{ $t('desktop.sendmessage') }}</span>
          </div>
          <div class="option" @click="makeVoiceCall">
            <img src="/Images/tabs/call-gray.svg" alt="icon" />
            <span>{{ $t('desktop.freeCall') }}</span>
          </div>
          <div class="option">
            <img src="/Images/tabs/video-call-fill-gray.svg" alt="icon" />
            <span>{{ $t('desktop.videocall') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getFile } from '@/helpers/parser.js';
import { IonIcon } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useUserStore } from '@/store/user/user.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useCallStore } from '@/store/call/call.js';

import coreHeader from '../coreHeader.vue';

const router = useRouter();
const overallChatsStore = useOverallChatsStore();
const nestedModalsDesktop = useNestedModalsDesktop();
const contactStore = useContactsStore();
const userStore = useUserStore();
const avatarUrl = ref('');
const OTOStore = useOtoStore();

const selectedContact = computed(() => {
  return contactStore.selectedConatct;
});

const contactName = computed(() => {
  if (contactStore.selectedConatct.name) {
    if (contactStore.selectedConatct.name.length > 20) {
      return contactStore.selectedConatct.name.slice(0, 20) + '...';
    } else {
      return contactStore.selectedConatct.name;
    }
  }
});

const openEditModal = () => {
  nestedModalsDesktop.changeStatusContactProfile(false);
  nestedModalsDesktop.changeStatusAddContact(true, 'edit');
};

const openChatRoom = () => {
  const targetChat = overallChatsStore.chatsList.find((chat) => {
    return chat.chatId == contactStore.selectedConatct.contact_username;
  });
  OTOStore.chatData = targetChat;
  const chatData = targetChat;
  if (!chatData.lastMessageData.guid && !chatData.lastSeenData.guid) {
    return;
  }
  if (!chatData.isFromMe) {
    OTOStore.sendSeenRequestOfMessage(
      chatData.chatId,
      chatData.lastMessageData.guid,
    );
  }
  OTOStore.prepardStartChatData(
    chatData.chatId,
    chatData.lastMessageData.guid,
    chatData.lastSeenData.guid,
    chatData.information.source,
  );
  const chatId = OTOStore.currentChatId;
  if (OTOStore.chatList[chatId]) {
    const messages = OTOStore.chatList[chatId].messages;
    OTOStore.chatList[chatId].messages = messages.splice(
      messages.length - 50,
      50,
    );
    OTOStore.currentChatId = chatData.chatId;
  }
  nestedModalsDesktop.contactProfile = false;
  router.push('/desktop/message');
  overallChatsStore.desktopActiveChat = chatData.chatId;
  nestedModalsDesktop.groupChatRoom = false;
  nestedModalsDesktop.coreModal = true;
  nestedModalsDesktop.OTOChatRoom = true;
  targetChat.badge = 0;
};

const makeVoiceCall = async () => {
  const contactStore = useContactsStore();
  const result = await contactStore.getContactInformation(
    contactStore.selectedConatct.contact_username,
  );
  const phoneNumber = result.phone_number || result.contact_phone;
  if (!phoneNumber) return;
  const callStore = useCallStore();
  callStore.makeFreeCall(phoneNumber);
  nestedModalsDesktop.contactProfile = false;
};

const closeModal = () => {
  nestedModalsDesktop.changeStatusContactProfile(false);
};

onMounted(async () => {
  if (selectedContact.value.avatarFileId) {
    const blob = await getFile(
      selectedContact.value.avatarFileId,
      userStore.token,
      'image',
    );
    avatarUrl.value = blob.filePath;
  }
});
</script>

<style scoped>
.contact-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
@keyframes bg-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-animation {
  0% {
    margin-top: 800px;
  }
  100% {
    margin-top: 0;
  }
}
.profile-modal-container {
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00000095;
  animation: 0.3 bg-animation;
}

.profile-modal {
  border-radius: 10px;
  overflow: hidden;
  width: 550px;
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  animation: 0.4s modal-animation;
}

.profile-container {
  width: 100%;
  height: 200px;
  background-position: cover;
  background-repeat: no-repeat;
  background-size: 100%;
}

.close-content {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: end;
  padding: 0 15px;
}

.info-content {
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: end;
  padding: 10px 15px;
  color: #fff;
}

.edit-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.profile-modal-dark {
  background: #303030;
  border: none;
}

.profile-modal .header {
  height: 85px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 22px;
  font-weight: 600;
}

.info-container {
  width: 80%;
  display: flex;
  align-items: center;
}

.close-container {
  width: 20%;
  display: flex;
  justify-content: end;
}

.info {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.name {
  font-size: 19px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.status {
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.content {
  width: 100%;
  padding: 15px 15px;
  color: #303030;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.account {
  color: #06f;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.item-container {
  width: 100%;
  display: flex;
  margin-top: 5px;
}

.item-info {
  width: 90%;
  display: flex;
  flex-direction: column;
}

.item-icon {
  width: 10%;
  display: flex;
  justify-content: center;
}

.text {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.title {
  color: rgba(0, 0, 0, 0.4);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.line {
  margin: 10px 0;
  width: 100%;
  height: 4px;
  background: #d9d9d9;
  backdrop-filter: blur(2px);
}

.options {
  display: flex;
  flex-direction: column;
}

.option {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 10px;
}

.option img {
  width: 20px;
  height: 20px;
}

.option span {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 10px;
}
</style>
