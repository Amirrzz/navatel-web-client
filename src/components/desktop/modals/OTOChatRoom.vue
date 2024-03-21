<template>
  <ChatToolbarHeader
    :activeBack="false"
    :name="chatData.information.name"
    :dirIsLtr="languageIsEnglish"
    :avatar="gettingImage"
    :avatarClass="chatData.information.avatarClass"
    :selectingChatIsActive="false"
    @makeVoiceCall="makeVoiceCall"
    @makeVideoCall="makeVideoCall"
    @onCopy="setCopyToClipboard('collectionOfMessage')"
    @back="back"
  />
  <DynamicVirtualScroller
    :list="getChatList"
    :scrollerClasses="['scroller', 'messages-container']"
    :showLoading="showLoading"
    :minItemSize="60"
    :hasPrevMessages="getHasPrevMessages"
    @setScrollerElement="setScrollerElement"
    @onScrollTop="getPrevMessages"
    @onScroll="setOnScrollState"
  >
    <template v-slot:item="{ item, index, active }">
      <KeepAlive>
        <MessageCard
          chatType="oto"
          :messageData="item"
          :name="item.additionalMessageInfo.ext_data"
          :isOnScrollState="onScrollState"
          :isSelected="selectedChatItems[item.id] ? true : false"
          :isSelectState="selectingChatIsActive"
          @click.self="clickEventHandler($event, item)"
          @setSelectedItems="setSelectedItems"
        />
      </KeepAlive>
    </template>
  </DynamicVirtualScroller>
  <ChatInput
    :replayMessageInfo="replayMessageInfo"
    @sendMessage="sendMessage"
    @closeManipulationContainer="replayMessageInfo = null"
    @setScrollerElement="setScrollerElement"
  />
</template>

<script setup>
import { popoverController } from '@ionic/vue';
import MessageCard from '@/components/message/basics/MessageCard/index.vue';
import DynamicVirtualScroller from '@/components/message/basics/DynamicVirtualScroller/index.vue';
import ChatInput from '@/components/desktop/message/basics/ChatInput/index.vue';
import ChatToolbarHeader from '@/components/desktop/message/basics/ChatToolbarHeader.vue';
import ContextMenuPopover from '@/components/message/basics/MessageCard/ContextMenuPopover.vue';

import { computed, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useUserStore } from '@/store/user/user';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useCallStore } from '@/store/call/call.js';
import { useVideoCallStore } from '@/store/videoCall/videoCall';

const nestedModalsDesktop = useNestedModalsDesktop();
const overallChatsStore = useOverallChatsStore();
const selectedChatItems = ref({});
const selectingChatIsActive = ref(false);
const replayMessageInfo = ref();

const onScrollState = ref(false);
const setOnScrollState = () => {
  if (onScrollState.value) return;
  onScrollState.value = true;
  setTimeout(() => {
    onScrollState.value = false;
  }, 500);
};

const chatData = computed(() => {
  const OTOStore = useOtoStore();
  return OTOStore.chatData;
});

const showLoading = computed(() => {
  const OTOStore = useOtoStore();
  return OTOStore.showLoading;
});

const getChatList = computed(() => {
  const OTOStore = useOtoStore();
  return OTOStore.getCurrentChat;
});

const makeVoiceCall = async () => {
  const contactStore = useContactsStore();
  const result = await contactStore.getContactInformation(
    chatData.value.chatId,
  );
  const phoneNumber = result.phone_number || result.contact_phone;
  if (!phoneNumber) return;
  const callStore = useCallStore();
  callStore.makeFreeCall(phoneNumber);
};

const makeVideoCall = () => {
  const OTOStore = useOtoStore();
  const { currentChatId } = OTOStore;
  const videoCallStore = useVideoCallStore();
  videoCallStore.makeConferenceInOTO(currentChatId);
};

const gettingImage = computed(() => {
  const fileManagerStore = useFileManagerStore();
  const profile =
    fileManagerStore.usersAvatarBlobList[
      chatData.value.information.avatarFileId
    ];
  if (profile && profile.thumbnailFile) {
    return profile.thumbnailFile;
  }
  return false;
});

const gettingUserInformation = computed(() => {
  const userStore = useUserStore();
  return {
    nickname: userStore.nickname,
    userId: userStore.userId,
  };
});

const languageIsEnglish = computed(() => {
  const { locale } = useI18n();
  return locale.value == 'en';
});

const sendMessage = (data) => {
  const OTOStore = useOtoStore();
  if (
    chatData.value.information.source ||
    chatData.value.information.wch_nickname
  ) {
    data['webChatData'] = {
      wch_nickname: chatData.value.information.name,
    };
  }
  OTOStore.send(data);
};

const setScrollerElement = (scrollerElement) => {
  const OTOStore = useOtoStore();
  OTOStore.setScrollerElement(scrollerElement);
};

const clickEventHandler = (event, item) => {
  if (selectingChatIsActive.value) {
    setSelectedItems(item);
    return;
  }
  openContextMenu(event, item);
};

const openContextMenu = async (event, messageData) => {
  selectingChatIsActive.value = false;
  if (messageData.type == 'missCall') return;
  event.preventDefault();
  const popover = await popoverController.create({
    component: ContextMenuPopover,
    event: event,
  });
  nextTick(async () => {
    await popover.present();
  });
  const { data, role } = await popover.onDidDismiss();
  if (role == 'confirm') {
    switch (data) {
      case 'onReply':
        replayMessageHandler(messageData);
        break;
      case 'onForward':
        forwardMessageHandler(messageData);
      case 'onCopy':
        setCopyToClipboard(messageData);
      default:
        break;
    }
  }
};

const setSelectedItems = (chatItem) => {
  const targetId = chatItem.id;
  selectingChatIsActive.value = true;
  if (selectedChatItems.value[targetId]) {
    delete selectedChatItems.value[targetId];
  } else {
    chatItem['targetName'] = chatItem.itsMe
      ? gettingUserInformation.value.nickname
      : chatData.value.information.name;
    chatItem['targetUserId'] = chatItem.itsMe
      ? gettingUserInformation.value.userId
      : chatData.value.chatId;
    selectedChatItems.value[targetId] = chatItem;
  }
};

const replayMessageHandler = (messageData) => {
  replayMessageInfo.value = {
    ...messageData,
    targetName: messageData.itsMe
      ? gettingUserInformation.value.nickname
      : chatData.value.information.name,
    targetUserId: messageData.itsMe
      ? gettingUserInformation.value.userId
      : chatData.value.chatId,
  };
};

const resetSelectingChat = () => {
  selectingChatIsActive.value = false;
  isSingleStateForwarding.value = false;
  selectedChatItems.value = {};
};

const setCopyToClipboard = (messageData) => {
  if (messageData?.type == 'text') {
    copyToClipboard(messageData.content);
  }
  if (messageData == 'collectionOfMessage') {
    const selectedMessagesData = Object.values(selectedChatItems.value);
    let text = '';
    selectedMessagesData.forEach((chatData) => {
      if (chatData.type == 'text') {
        text += chatData.content + '\n';
      }
    });
    copyToClipboard(text);
  }
  resetSelectingChat();
};

const getHasPrevMessages = computed(() => {
  const OTOStore = useOtoStore();
  return OTOStore.getHasPrevMessages;
});

const preventSendGetMessage = ref(false);
const getPrevMessages = () => {
  if (preventSendGetMessage.value) return;
  preventSendGetMessage.value = true;
  const OTOStore = useOtoStore();
  OTOStore.getPrevMessages({
    chatId: chatData.value.chatId,
    targetMessageId: getChatList.value[0].id,
    count: 50,
    source: chatData.value.information.source,
    isDuringChat: true,
  }).then(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        preventSendGetMessage.value = false;
      });
    });
  });
};

const back = () => {
  overallChatsStore.desktopActiveChat = '';
  nestedModalsDesktop.coreModal = false;
  nestedModalsDesktop.OTOChatRoom = false;
};
</script>

<style scoped>
.oto-chat-room-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  z-index: 1;
  margin-top: 0px;
  animation: 0.3s load;
  color: black;
}

@keyframes load {
  0% {
    margin-top: 700px;
  }
  100% {
    margin-top: 0;
  }
}
</style>
