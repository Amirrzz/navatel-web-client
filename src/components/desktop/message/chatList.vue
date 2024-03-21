<template>
  <div
    v-bind="containerProps"
    class="list-container"
    :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
  >
    <div v-bind="wrapperProps">
      <div v-for="item in list" :key="item.index">
        <ChatListItem
          @getUserProfile="getUserProfile"
          @getAddionalProfileInfo="emit('handelGettingUserData', item.data)"
          @getGroupInformation="getGroupInformation($event)"
          @click="emit('openChatRoom', item.data)"
          :item="item.data"
        ></ChatListItem>
      </div>
      <div class="floting-button-content" @click="openPopUp">
        <img src="/Images/tabs/pencil.svg" alt="icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { popoverController } from '@ionic/vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useVirtualList } from '@vueuse/core';
import { computed, defineProps, defineEmits, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGroupChat } from '@/store/chats/groupChat';
import { detectNameForNotifChatList } from '@/helpers/overallChatListParser.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';

import ChatListItem from '@/components/desktop/message/chatListItem.vue';
import PopUp from '@/components/desktop/message/MessagesDeatail.vue';

const { locale } = useI18n();
const { t } = useI18n();
const overallChatsStore = useOverallChatsStore();

const activeChat = computed(() => {
  return overallChatsStore.desktopActiveChat;
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

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const openPopUp = async (event) => {
  event.preventDefault();
  const popover = await popoverController.create({
    component: PopUp,
    event: event,
  });
  await popover.present();
};

const getterList = computed(() => {
  return props.list;
});

const emit = defineEmits(['openChatRoom']);

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
  getterList,
  {
    itemHeight: 65,
    overscan: 10,
  },
);

watch(activeChat, (oldValue, newValue) => {
  const targetChat = overallChatsStore.chatsList.find((chat) => {
    return chat.chatId == activeChat.value;
  });
  const detectIndex = overallChatsStore.chatsList.indexOf(targetChat);
  scrollTo(detectIndex);
});

const getUserProfile = async (chatItem) => {
  if (!chatItem.chatId) return;
  const contactStore = useContactsStore();
  contactStore.getUserProfileHandler(chatItem.chatId, true).then((result) => {
    const overallChatsStore = useOverallChatsStore();
    const targetChat = overallChatsStore.chatsList.find(
      (chat) => chat.chatId == chatItem.chatId,
    );
    if (targetChat) {
      targetChat.information.name = result.nickname;
      targetChat.phoneNumber = result.phone_number;
      targetChat.information.avatarFileId = result.avatarFileId;
      targetChat.information.synced = true;
    }
    chatItem.information.name = result.nickname;
    chatItem.phoneNumber = result.phone_number;
    chatItem.information.avatarFileId = result.avatarFileId;
    if (!contactStore.contactsIsLoading) {
      chatItem.information.synced = true;
    }
  });
};

const createMessageContentByMtype = async (mtype) => {
  switch (mtype) {
    case 'grp.doc':
      return `${t('tabs.message.group.docmessage')}`;
      break;
    case 'grp.aud':
      return `${t('tabs.message.group.audiomessage')}`;
      break;
    case 'grp.stk':
      return `${t('tabs.message.group.stickermessage')}`;
      break;
    case 'grp.vid':
      return `${t('tabs.message.group.videomessage')}`;
      break;
    case 'grp.img':
      return `${t('tabs.message.group.photomessage')}`;
      break;
  }
};

const getGroupInformation = async (event) => {
  const fileManagerStore = useFileManagerStore();
  const groupChatStore = useGroupChat();
  switch (event.lastMessageInfo.mtype) {
    case 'grp.txt':
      event.lastMessageData.content = event.lastMessageInfo.message;
      break;
    case 'grp.doc':
      event.lastMessageData.content = await createMessageContentByMtype(
        event.lastMessageInfo.mtype,
      );
      event.lastMessageData.type = 'grp.doc';
      break;
    case 'grp.aud':
      event.lastMessageData.content = await createMessageContentByMtype(
        event.lastMessageInfo.mtype,
      );
      event.lastMessageData.type = 'grp.aud';
      break;
    case 'grp.stk':
      event.lastMessageData.content = await createMessageContentByMtype(
        event.lastMessageInfo.mtype,
      );
      event.lastMessageData.type = 'grp.stk';
      break;
    case 'grp.vid':
      event.lastMessageData.content = await createMessageContentByMtype(
        event.lastMessageInfo.mtype,
      );
      event.lastMessageData.type = 'grp.vid';
      break;
    case 'grp.img':
      event.lastMessageData.content = await createMessageContentByMtype(
        event.lastMessageInfo.mtype,
      );
      event.lastMessageData.type = 'grp.img';
      break;
    case 'grp.add':
      const adminNameAddStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      const userNameAddStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.data.uuid,
      );
      event.lastMessageData.content = `${adminNameAddStatus} ${t(
        'tabs.message.group.addedtogroup',
      )} ${userNameAddStatus}`;
      break;
    case 'grp.rmv':
      const adminNameRemoveStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      const userNameRemoveStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.data.uuid,
      );
      event.lastMessageData.content = `${adminNameRemoveStatus} ${t(
        'tabs.message.group.removed',
      )} ${userNameRemoveStatus}`;
      break;
    case 'grp.crt':
      const adnibNameCreateStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      event.lastMessageData.content = `${adnibNameCreateStatus} ${t(
        'tabs.message.group.createdgroup',
      )}`;
      break;
    case 'grp.lft':
      const userNameLeftStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      event.lastMessageData.content = `${userNameLeftStatus} ${t(
        'tabs.message.group.leftthegroup',
      )}`;
      break;
    case 'grp.cfg.avt':
      const adminNameUpdateAvatarStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      event.lastMessageData.content = `${adminNameUpdateAvatarStatus} ${t(
        'tabs.message.group.changeavatar',
      )}`;
      break;
    case 'grp.cfg.tit':
      const adminNameUpdateTitleStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      event.lastMessageData.content = `${adminNameUpdateTitleStatus} ${t(
        'tabs.message.group.changename',
      )}...`;
      break;
    case 'grp.cfg.avt':
      const userNameJoinStatus = await detectNameForNotifChatList(
        event.lastMessageInfo.from,
      );
      event.lastMessageData.content = `${userNameJoinStatus} ${t(
        'tabs.message.group.join',
      )}`;
      break;
  }
  const groupAvatarFileId = await groupChatStore.getGroupAvatarFileId(
    event.chatId,
  );
  if (groupAvatarFileId && groupAvatarFileId !== 'capture_photo') {
    event.information.avatarFileId = groupAvatarFileId;
    fileManagerStore.gettingAvatarsHandler(groupAvatarFileId);
  }
  event.information.synced = true;
};
</script>

<style scoped>
.floting-button-content {
  background: #428cff;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}

.floting-button-content img {
  width: 20px;
  height: 20px;
}
::-webkit-scrollbar {
  width: 5px;
  border: 2px solid #2c2c2c;
  border-radius: 5px;
}

::-webkit-scrollbar-track {
  border-radius: 5px;
  background: #eeeeee;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: #cac8c8;
}

.firstchar-container {
  font-weight: bold;
  font-size: calc(30px - 1vmin);
}

.list-container {
  scrollbar-width: none;
  height: calc(80vh);
  overflow: hidden;
  padding: 10px 10px;
}
.list-container::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none; /* Hide scrollbar in IE, Edge, and Firefox */
}
</style>
