<template>
  <ion-page>
    <div
      class="chat-list-container"
      dir="rtl"
      :class="{ 'group-chat-selected': selectedGroupChat }"
    >
      <div class="chat-list-loading" v-if="chatsListLoading">
        <ChatRoomLoading />
      </div>
      <ChatList
        v-else
        :list="chatsList"
        @handelGettingUserData="handelGettingchatItemData"
        @openChatRoom="openChatRoomModal"
      >
      </ChatList>
    </div>
  </ion-page>
</template>

<script setup>
import { IonPage } from '@ionic/vue';
import ChatRoomLoading from '@/components/desktop/message/chatRoomLoading.vue';
import ChatList from '@/components/desktop/message/chatList.vue';
import { computed, onBeforeMount, ref } from 'vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useGroupChat } from '@/store/chats/groupChat';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useCallStore } from '@/store/call/call.js';

const overallChatsStore = useOverallChatsStore();
const groupChatStore = useGroupChat();
const OTOStore = useOtoStore();
const nestedModalsDesktop = useNestedModalsDesktop();
const messageCount = ref(0);

let chatsList = computed(() => overallChatsStore.getListChats);
let chatsListLoading = computed(() => overallChatsStore.chatsListLoading);

const currentGroupInfo = computed(() => {
  return groupChatStore.currentGroup;
});
const selectedGroupChat = ref(false);

const showCallingModal = computed(() => {
  const callStore = useCallStore();
  return callStore.getCallModalStatus.showModal;
});

const openChatRoomModal = async (chatItem) => {
  if (showCallingModal) {
    nestedModalsDesktop.callingModalState = false;
    nestedModalsDesktop.fullScreenCall = false;
    nestedModalsDesktop.minimizeCallState = true;
  }
  const targetChat = overallChatsStore.chatsList.find((chat) => {
    return chat.chatId == chatItem.chatId;
  });
  if (chatItem.groupData) {
    selectedGroupChat.value = true;
    groupChatStore.clearCurrentGroup();
    currentGroupInfo.value.group_id = await chatItem.groupData.groupId;
    await groupChatStore.getGroupAvatar(currentGroupInfo.value.group_id);
    await groupChatStore.getGroupTitle(currentGroupInfo.value.group_id);
    await groupChatStore.getGroupMembersUid(currentGroupInfo.value.group_id);
    messageCount.value = 50;
    await groupChatStore.loadedCurrentGroupMessages(
      currentGroupInfo.value.group_id,
      messageCount.value,
    );
    overallChatsStore.desktopActiveChat = chatItem.groupData.groupId;
    if (currentGroupInfo.value.title != '') {
      nestedModalsDesktop.OTOChatRoom = false;
      nestedModalsDesktop.coreModal = true;
      nestedModalsDesktop.groupChatRoom = true;
      groupChatStore.inGroupChatRoomDesktop = true;
      targetChat.badge = 0;
    }
    if (groupChatStore.currentGroup.messages[0].type == 'notify.crt') {
      groupChatStore.getHasPrevMessages = false;
    } else {
      groupChatStore.getHasPrevMessages = true;
    }
  } else {
    selectedGroupChat.value = false;
    OTOStore.chatData = chatItem;
    const chatData = chatItem;
    OTOStore.currentChatId = chatData.chatId;
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
    overallChatsStore.desktopActiveChat = chatData.chatId;
    nestedModalsDesktop.groupChatRoom = false;
    nestedModalsDesktop.coreModal = true;
    nestedModalsDesktop.OTOChatRoom = true;
    targetChat.badge = 0;
  }
};

onBeforeMount(() => {
  const groups = localStorage.getItem('groups');
  if (!groups) {
    const array = [];
    const json = JSON.stringify(array);
    localStorage.setItem('groups', json);
  }
});
</script>

<style scoped>
.chat-list-container {
  height: 100%;
}
.chat-list-loading {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
ion-toolbar {
  --min-height: 10vh;
  height: 10vh;
}
.toolbar-title {
  font-size: 32px;
}

.header-title {
  color: #fff;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 0 10px;
}

.search-icon {
  margin-top: 8px;
}
ion-content::part(scroll) {
  scrollbar-width: none;
  overflow-y: hidden;
}

.loading-container {
  width: 100%;
  padding: 5px 10px;
}
.group-chat-selected {
  --mines-chat-card-size: 60px;
}
</style>
