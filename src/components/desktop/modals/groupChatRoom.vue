<template>
  <ChatToolbarHeader
    :hasCall="false"
    :activeBack="false"
    :name="currentGroupInfo.title"
    :dirIsLtr="languageIsEnglish"
    avatarClass="avatar-color-5"
    :selectingChatIsActive="selectingChatIsActive"
    @openProfileModal="openGroupDetail"
    @onForward="openFordadedMessage"
    @onCopy="setCopyToClipboard('collectionOfMessage')"
    @resetSelectingChat="resetSelectingChat"
    @back="back"
    @makeVideoCall="makeVideoCall"
  />
  <DynamicVirtualScroller
    :list="getMessages"
    :scrollerClasses="[
      'scroller',
      'messages-container',
      'group-chat-container',
    ]"
    :showLoading="showLoading"
    :minItemSize="60"
    :hasPrevMessages="hasPrevMessages"
    @setScrollerElement="setScrollerElement"
    @onScrollTop="getPrevMessages"
    @onScroll="setOnScrollState"
  >
    <template v-slot:item="{ item, index, active }">
      <KeepAlive>
        <MessageCard
          chatType="group"
          :messageData="item"
          :name="item.additionalMessageInfo.ext_data"
          :isSelected="selectedChatItems[item.id] ? true : false"
          :isSelectState="selectingChatIsActive"
          @click.self="clickEventHandler($event, item)"
          @setSelectedItems="setSelectedItems"
        />
      </KeepAlive>
    </template>
  </DynamicVirtualScroller>
  <ChatInput
    @sendMessage="sendMessageHandler"
    :replayMessageInfo="replayMessageInformation"
    @closeManipulationContainer="replayMessageInformation = null"
  />
</template>

<script setup>
import { modalController, popoverController } from '@ionic/vue';
import MessageCard from '@/components/message/basics/MessageCard/index.vue';
import DynamicVirtualScroller from '@/components/message/basics/DynamicVirtualScroller/index.vue';
import ChatInput from '@/components/desktop/message/basics/ChatInput/index.vue';
import ChatToolbarHeader from '@/components/desktop/message/basics/ChatToolbarHeader.vue';
import { useGroupChat } from '@/store/chats/groupChat.js';
import { computed, onMounted, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { copyToClipboard } from '@/helpers/browserApis.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useUserStore } from '@/store/user/user';
import { useVideoCallStore } from '@/store/videoCall/videoCall';
import ContextMenuPopover from '@/components/message/basics/MessageCard/ContextMenuPopover.vue';

const nestedModalsDesktop = useNestedModalsDesktop();
const overallChatsStore = useOverallChatsStore();
const videoCallStore = useVideoCallStore();

const languageIsEnglish = computed(() => {
  const { locale } = useI18n();
  return locale.value == 'en';
});

const groupChatstore = useGroupChat();
const selectedChatItems = ref({});
const selectingChatIsActive = ref(false);
const replayMessageInformation = ref(null);

const resetSelectingChat = () => {
  selectingChatIsActive.value = false;
  selectedChatItems.value = {};
};

const showLoading = computed(() => {
  return groupChatstore.loading;
});

const currentGroupInfo = computed(() => {
  return groupChatstore.currentGroup;
});

const getMessages = computed(() => {
  return groupChatstore.currentGroup.messages;
});

const clickEventHandler = (event, item) => {
  if (selectingChatIsActive.value) {
    setSelectedItems(item);
    return;
  }
  openContextMenu(event, item);
};

const openContextMenu = async (event, messageData) => {
  selectingChatIsActive.value = false;
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

const onScrollState = ref(false);
const setOnScrollState = () => {
  if (onScrollState.value) return;
  onScrollState.value = true;
  setTimeout(() => {
    onScrollState.value = false;
  }, 500);
};

const sendMessageHandler = (event) => {
  if (event.repliedData) {
    groupChatstore.handleSendMessage(
      event,
      replayMessageInformation.value,
      'replay',
    );
  } else if (event.type == 'image') {
    groupChatstore.handleSendMessage(event, '', 'image');
  } else if (event.type == 'video') {
    groupChatstore.handleSendMessage(event, '', 'video');
  } else if (event.forceFileType == 'file') {
    groupChatstore.handleSendMessage(event, '', 'file');
  } else if (event.type == 'audio') {
    groupChatstore.handleSendMessage(event, '', 'file');
  } else {
    groupChatstore.handleSendMessage(event, '', 'text');
  }
};

const setScrollerElement = (event) => {
  groupChatstore.scrollValue = event;
};

const setSelectedItems = (chatItem) => {
  const targetId = chatItem.id;
  selectingChatIsActive.value = true;
  if (selectedChatItems.value[targetId]) {
    delete selectedChatItems.value[targetId];
  } else {
    chatItem['targetName'] =
      chatItem.additionalMessageInfo.userInformation.name;
    selectedChatItems.value[targetId] = chatItem;
  }
};

const openGroupDetail = () => {};

const hasPrevMessages = computed(() => {
  return groupChatstore.getHasPrevMessages;
});

const preventSendGetMessage = ref(false);
const getPrevMessages = async () => {
  if (preventSendGetMessage.value) return;
  preventSendGetMessage.value = true;
  await groupChatstore.loadPreviouslyMessages();
  preventSendGetMessage.value = false;
};

const openFordadedMessage = () => {
  requestAnimationFrame(async () => {
    const modal = await modalController.create({
      component: ForwardedModal,
      componentProps: {
        messages: selectedChatItems.value,
      },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role == 'confirm') {
      resetSelectingChat();
    }
  });
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

const replayedMessage = (event) => {
  let name = null;
  if (event.additionalMessageInfo.userInformation.name) {
    name = event.additionalMessageInfo.userInformation.name;
  } else {
    name = event.additionalMessageInfo.userInformation.nickname;
  }
  replayMessageInformation.value = {
    ...event,
    name: name,
  };
};

const seenMessage = (event) => {
  const userStore = useUserStore();
  if (event.type) {
    if (
      event.additionalMessageInfo.uuid != userStore.userId &&
      event.status == 'sent'
    ) {
      groupChatstore.seenedMessage(event);
    }
  }
};

const back = () => {
  overallChatsStore.desktopActiveChat = '';
  groupChatstore.clearCurrentGroup();
  nestedModalsDesktop.coreModal = false;
  nestedModalsDesktop.groupChatRoom = false;
  groupChatstore.inGroupChatRoomDesktop = false;
};

const makeVideoCall = () => {
  videoCallStore.makeConferenceInGroup();
};

onMounted(async () => {
  await groupChatstore.getFirstMessageId();
  await groupChatstore.checkActiveCall();
});
</script>

<style scoped>
.group-chat-room-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  z-index: 1;
  margin-top: 0px;
  animation: 0.3s load;
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
<style>
.group-chat-container {
  --mines-chat-card-size: 60px;
}
</style>
