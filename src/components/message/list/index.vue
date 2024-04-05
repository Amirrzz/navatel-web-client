<template>
  <div
    v-bind="containerProps"
    class="list-container"
    :class="{ 'group-chat-selected': selectedGroupChat }"
  >
    <div v-bind="wrapperProps">
      <div
        v-for="(item, index) in list"
        :key="index + item.data.chatId + '-item-chat-list'"
        class="list-item"
      >
        <ChatListItem
          :item="item.data"
          @getUserProfile="getUserProfile"
          @getGroupInformation="getGroupInformation($event)"
          @click="openHandlerChatRoom(item.data)"
        ></ChatListItem>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { modalController } from '@ionic/vue';
import { useVirtualList } from '@vueuse/core';
import { computed, defineProps, onBeforeMount, onMounted, ref } from 'vue';
import ChatListItem from '@/components/message/list/ListItem.vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useGroupChat } from '@/store/chats/groupChat';
import OTOChatModal from '@/components/message/OTO/index.vue';
import GroupChatRoom from '@/components/message/groups/index.vue';
import IframeOTOChatModal from '@/components/message/OTO/iframeMessages.vue';
import IframeGroupChatRoom from '@/components/message/groups/iframeMessages.vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { detectNameForNotifChatList } from '@/helpers/overallChatListParser.js';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user/user.js';
import { useRTMStore } from '@/store/rtm/rtm.js';

const { t } = useI18n();
const route = useRoute();
const userStore = useUserStore();

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});
const getterList = computed(() => {
  return props.list;
});

const isIframe = ref(false);

const { list, containerProps, wrapperProps } = useVirtualList(getterList, {
  // Keep `itemHeight` in sync with the item's row.
  itemHeight: 65,
  overscan: 10,
});

const openOTOChatRoomModal = async (chatItem) => {
  const otoStore = useOtoStore();
  otoStore.currentChatId = chatItem.chatId;
  if (!chatItem.information.name) {
    const contactStore = useContactsStore();
    const profile = contactStore.contacts.unSavedUsers.find(
      (e) => e?.uuid == chatItem.chatId,
    );
    if (profile?.nickname) chatItem.information['name'] = profile?.nickname;
  }
  const modal = await modalController.create({
    component: isIframe.value ? IframeOTOChatModal : OTOChatModal,
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

const openGroupChatRoomModal = (chatItem) => {
  const groupChatStore = useGroupChat();
  groupChatStore.currentGroup.group_id = chatItem.groupData.groupId;
  requestAnimationFrame(async () => {
    const modal = await modalController.create({
      component: isIframe.value ? IframeGroupChatRoom : GroupChatRoom,
    });
    modal.present();
    groupChatStore.updateInChatRoomStatus(true);
  });
};

const getUserProfile = async (chatItem) => {
  if (!chatItem.chatId) return;
  const contactStore = useContactsStore();
  const user = await contactStore.getUserProfileHandler(chatItem.chatId, true);
  const overallChatsStore = useOverallChatsStore();
  const targetChat = overallChatsStore.chatsList.find(
    (chat) => chat.chatId == chatItem.chatId,
  );
  if (targetChat) {
    targetChat.information.name = user.nickname;
    targetChat.phoneNumber = user.phone_number;
    targetChat.information.avatarFileId = user.avatarFileId;
    targetChat.information.synced = true;
  }
  chatItem.information.name = user.nickname;
  chatItem.phoneNumber = user.phone_number;
  chatItem.information.avatarFileId = user.avatarFileId;
  if (!contactStore.contactsIsLoading) {
    chatItem.information.synced = true;
  }
};
const selectedGroupChat = ref(false);
const openHandlerChatRoom = (item) => {
  if (item.groupData) {
    selectedGroupChat.value = true;
    openGroupChatRoomModal(item);
    return;
  }
  selectedGroupChat.value = false;

  openOTOChatRoomModal(item);
};

onMounted(async () => {
  if (route.query.chatId) {
    isIframe.value = true;
    if (!userStore.token) {
      const parsedToken = userStore.parseJwtPayload(route.query.token);
      userStore.handelUserInformationProccess(
        route.query.token,
        parsedToken.sub,
      );
      userStore.setUserInformation(
        parsedToken.sub,
        parsedToken.nickname,
        parsedToken.phone,
      );
      const RTMStore = useRTMStore();
      RTMStore.connect();
    }
    const overallChatsStore = useOverallChatsStore();
    await overallChatsStore.getChatList();

    let targetChat = overallChatsStore.chatsList.find(
      (chat) => chat.chatId == route.query.chatId,
    );

    if (!targetChat) {
      targetChat = {
        chatId: route.query.chatId,
        information: {},
      };
    }

    openHandlerChatRoom(targetChat);
  }
});

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

onBeforeMount(() => {
  const otoStore = useOtoStore();
  otoStore.currentChatId = '';
});
</script>

<style scoped>
.firstchar-container {
  font-weight: bold;
  font-size: calc(30px - 1vmin);
}
.item-container {
  display: flex;
  width: 100%;
  align-items: flex-end;
}
.set-center {
  align-items: center;
  font-size: calc(30px - 2vmin);
}
.list-container {
  scrollbar-width: none;
  height: 100%;
  overflow: hidden;
  padding-bottom: 15vh;
}
.list-item {
  height: 65px;
}
.list-container::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none; /* Hide scrollbar in IE, Edge, and Firefox */
}
.group-chat-selected {
  --mines-chat-card-size: 60px;
}
</style>
