<template>
  <ChatToolbarHeader
    :name="chatData.information.name"
    :selectingChatIsActive="selectingChatIsActive"
    :selectedChatCount="getSelectedChatCount"
    @openProfileModal="openContactProfileModal"
    @resetSelectingChat="resetSelectingChat"
    @onCopy="setCopyToClipboard('collectionOfMessage')"
  >
  </ChatToolbarHeader>
  <DynamicVirtualScroller
    :list="getChatList"
    :scrollerClasses="['scroller', 'messages-container', 'iframe-messages']"
    :showLoading="showLoading"
    :hasPrevMessages="getHasPrevMessages"
    @setScrollerElement="setScrollerElement"
    @onScrollTop="getPrevMessages"
  >
    <template v-slot:item="{ item, index, active }">
      <KeepAlive>
        <MessageCard
          :key="'chat-oto-' + item.id + '-' + index"
          :id="`chat-oto-${item.id}`"
          :index="`chat-oto-${item.id}`"
          :messageData="item"
          :name="chatData.information.name"
          :isSelected="selectedChatItems[item.id] ? true : false"
          :isSelectState="selectingChatIsActive"
          @click.self="setSelectedItems(item)"
          @setSelectedItems="setSelectedItems"
          @onReply="replayMessageHandler"
          @onScrollToTargetChat="prepardDataToScrollTargetMessage"
          @onCopy="setCopyToClipboard"
        ></MessageCard>
      </KeepAlive>
    </template>
  </DynamicVirtualScroller>
  <ChatInput
    :replayMessageInfo="replayMessageInfo"
    @sendMessage="sendMessage"
    @edit="editMessage"
    @replay="replayMessage"
    @sendVoice="sendVoiceAudio"
    @closeManipulationContainer="replayMessageInfo = null"
  ></ChatInput>
</template>
<script setup>
import { modalController } from '@ionic/vue';
import {
  ref,
  computed,
  defineProps,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useCallStore } from '@/store/call/call.js';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import ChatToolbarHeader from '@/components/message/iframe/ChatToolbarHeader.vue';
import DynamicVirtualScroller from '@/components/message/basics/DynamicVirtualScroller/index.vue';
import MessageCard from '@/components/message/iframe/MessageCard/index.vue';
import ChatInput from '@/components/message/iframe/ChatInput.vue';
import ProfileContactModal from '@/components/contacts/profile/index.vue';
import ForwardedModal from '@/components/message/basics/Forward/index.vue';
import { useVideoCallStore } from '@/store/videoCall/videoCall';
import { copyToClipboard } from '@/helpers/browserApis.js';

const props = defineProps({
  chatData: {
    type: Object,
    default: () => {},
  },
});
const showLoading = computed(() => {
  const OTOStore = useOtoStore();
  return OTOStore.showLoading;
});
const getChatList = computed(() => {
  const OTOStore = useOtoStore();
  return OTOStore.getCurrentChat;
});
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
    chatId: props.chatData.chatId,
    targetMessageId: getChatList.value[0].id,
    count: 50,
    source: props.chatData.information.source,
    isDuringChat: true,
  }).then(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        preventSendGetMessage.value = false;
      });
    });
  });
};
const getSelectedChatCount = computed(() => {
  return Object.keys(selectedChatItems.value).length || 0;
});
const sendMessage = (data) => {
  const OTOStore = useOtoStore();
  if (
    props.chatData.information.source ||
    props.chatData.information.wch_nickname
  ) {
    data['webChatData'] = {
      wch_nickname: props.chatData.information.name,
    };
  }
  OTOStore.send(data);
};
const editMessage = (data) => {};
const replayMessage = (data) => {};

const sendVoiceAudio = (data) => {
  const OTOStore = useOtoStore();

  OTOStore.send({
    files: [data],
  });
};
const replayMessageInfo = ref();
const replayMessageHandler = (messageData) => {
  replayMessageInfo.value = {
    ...messageData,
    name: props.chatData.information.name,
  };
};
const selectedChatItems = ref({});
const selectingChatIsActive = ref(false);

const setSelectedItems = (chatItem) => {
  const targetId = chatItem.id;
  selectingChatIsActive.value = true;
  if (selectedChatItems.value[targetId]) {
    delete selectedChatItems.value[targetId];
  } else {
    chatItem['targetName'] = props.chatData.information.name;
    selectedChatItems.value[targetId] = chatItem;
  }
};
const resetSelectingChat = () => {
  selectingChatIsActive.value = false;
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
const setScrollerElement = (scrollerElement) => {
  const OTOStore = useOtoStore();
  OTOStore.setScrollerElement(scrollerElement);
};
const prepardDataToScrollTargetMessage = (repliedTargetId) => {
  const OTOStore = useOtoStore();
  const indexMessageInList = OTOStore.getCurrentChat.findIndex(
    (e) => e.id == repliedTargetId,
  );
  if (indexMessageInList == -1) {
    const OTOStore = useOtoStore();
    OTOStore.repliedMessageHandler({
      chatId: props.chatData.chatId,
      targetMessageId: repliedTargetId,
    }).then((result) => {
      scrollToElement(result);
      // result should be {
      //  repliedMessageId:xxx,
      //  indexMessageInList:xxx
      //  }
    });
    return;
  }
  scrollToElement({ repliedTargetId: repliedTargetId, indexMessageInList });
};
const scrollToElement = ({ repliedTargetId, indexMessageInList }) => {
  const OTOStore = useOtoStore();
  const scrollerElement = OTOStore.scrollerElement.$el;
  const targetElement = scrollerElement.querySelector(
    `#chat-oto-${repliedTargetId}`,
  );
  requestAnimationFrame(() => {
    OTOStore.scrollerElement.scrollToItem(indexMessageInList);
    if (targetElement) {
      targetElement.classList.add('is-target-for-replied');
      targetElement.addEventListener('animationend', () => {
        targetElement.classList.remove('is-target-for-replied');
      });
    }
  });
};
const openContactProfileModal = () => {
  requestAnimationFrame(async () => {
    const modal = await modalController.create({
      component: ProfileContactModal,
      componentProps: {
        userId: props.chatData.chatId,
        name: props.chatData.information.name,
        phoneNumber: props.chatData.information.phoneNumber,
      },
    });

    modal.present();
  });
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

onMounted(() => {
  const OTOStore = useOtoStore();
  const chatData = props.chatData;
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
});

onUnmounted(() => {
  const OTOStore = useOtoStore();
  const chatId = OTOStore.currentChatId;
  const messages = OTOStore.chatList[chatId].messages;
  OTOStore.chatList[chatId].messages = messages.splice(
    messages.length - 50,
    50,
  );
  OTOStore.currentChatId = '';
});
</script>

<style>
.iframe-messages {
  background-color: #fff !important;
}
.iframe-messages::-webkit-scrollbar {
  width: 8px;
  /* display: none; */
}
.iframe-messages::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
.iframe-messages::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
}
</style>
