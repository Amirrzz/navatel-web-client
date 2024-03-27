<template>
  <ChatToolbarHeader
    :name="chatData.information.name"
    :avatar="gettingImage"
    :dirIsLtr="languageIsEnglish"
    :avatarClass="chatData.information.avatarClass"
    :isMySelf="chatData.isMySelf"
    :selectingChatIsActive="selectingChatIsActive"
    :selectedChatCount="getSelectedChatCount"
    @makeVoiceCall="makeVoiceCall"
    @makeVideoCall="makeVideoCall"
    @openProfileModal="openContactProfileModal"
    @resetSelectingChat="resetSelectingChat"
    @onCopy="setCopyToClipboard"
    @onForward="openFordadedMessage"
  >
  </ChatToolbarHeader>
  <ion-content :scroll-y="false">
    <DynamicVirtualScroller
      :list="getChatList"
      :showLoading="showLoading"
      scrollerClasses="scroller messages-container"
      @setScrollerElement="setScrollerElement"
      @onScrollTop="getPrevMessages"
      @onScroll="setOnScrollState"
      :hasPrevMessages="getHasPrevMessages"
    >
    </DynamicVirtualScroller>
  </ion-content>
  <!-- Container element where the pre-rendered items will be injected -->
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
import { modalController, popoverController, IonContent } from '@ionic/vue';
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
import ChatToolbarHeader from '@/components/message/OTO/ChatToolbarHeader.vue';
import DynamicVirtualScroller from '@/components/message/basics/DynamicVirtualScroller/index.vue';
import MessageCard from '@/components/message/basics/MessageCard/index.vue';
import ChatInput from '@/components/message/basics/ChatInput/index.vue';
import ProfileContactModal from '@/components/contacts/profile/index.vue';
import ForwardedModal from '@/components/message/basics/Forward/index.vue';
import { useVideoCallStore } from '@/store/videoCall/videoCall';
import { copyToClipboard } from '@/helpers/browserApis.js';
import { useUserStore } from '@/store/user/user';
import ContextMenuPopover from '@/components/message/basics/MessageCard/ContextMenuPopover.vue';

const languageIsEnglish = computed(() => {
  const { locale } = useI18n();
  return locale.value == 'en';
});
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
  console.log('getPrevMessage');
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
const gettingImage = computed(() => {
  const fileManagerStore = useFileManagerStore();
  const profile =
    fileManagerStore.usersAvatarBlobList[
      props.chatData.information.avatarFileId
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
  data['title'] = props.chatData.information.name;
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
const onScrollState = ref(false);
const setOnScrollState = () => {
  if (onScrollState.value) return;
  onScrollState.value = true;
  setTimeout(() => {
    onScrollState.value = false;
  }, 500);
};
const clickEventHandler = ({ event, messageData }) => {
  if (selectingChatIsActive.value) {
    setSelectedItems(messageData);
    return;
  }
  openContextMenu(event, messageData);
};

const replayMessageInfo = ref();
const replayMessageHandler = (messageData) => {
  replayMessageInfo.value = {
    ...messageData,
    targetName: messageData.itsMe
      ? gettingUserInformation.value.nickname
      : props.chatData.information.name,
    targetUserId: messageData.itsMe
      ? gettingUserInformation.value.userId
      : props.chatData.chatId,
  };
};
const isSingleStateForwarding = ref(false);
const forwardMessageHandler = (chatItem) => {
  isSingleStateForwarding.value = true;
  const targetId = chatItem.id;
  chatItem['targetName'] = chatItem.itsMe
    ? gettingUserInformation.value.nickname
    : props.chatData.information.name;
  chatItem['targetUserId'] = chatItem.itsMe
    ? gettingUserInformation.value.userId
    : props.chatData.chatId;
  selectedChatItems.value[targetId] = chatItem;
  openFordadedMessage();
};
const makeVoiceCall = async () => {
  const contactStore = useContactsStore();
  const result = await contactStore.getContactInformation(
    props.chatData.chatId,
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
const selectedChatItems = ref({});
const selectingChatIsActive = ref(false);

const setSelectedItems = (messageData) => {
  const targetId = messageData.id;
  selectingChatIsActive.value = true;
  if (selectedChatItems.value[targetId]) {
    delete selectedChatItems.value[targetId];
  } else {
    messageData['targetName'] = messageData.itsMe
      ? gettingUserInformation.value.nickname
      : props.chatData.information.name;
    messageData['targetUserId'] = messageData.itsMe
      ? gettingUserInformation.value.userId
      : props.chatData.chatId;
    selectedChatItems.value[targetId] = messageData;
  }
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
const setScrollerElement = (scrollerElement) => {
  const OTOStore = useOtoStore();
  OTOStore.setScrollerElement(scrollerElement);
};

const scrollToElement = ({
  repliedTargetId,
  indexMessageInList,
  targetIdToObservEndPointer,
}) => {
  const OTOStore = useOtoStore();
  const scrollerElement = OTOStore.scrollerElement.$el;
  nextTick(() => {
    const targetElement = scrollerElement.querySelector(
      `#chat-oto-${repliedTargetId}`,
    );
    setTimeout(() => {
      nextTick(() => {
        requestAnimationFrame(() => {
          OTOStore.scrollerElement.scrollToItem(indexMessageInList);
        });
        if (targetElement) {
          targetElement.classList.remove('is-target-for-replied');
          setTimeout(() => {
            targetElement.classList.add('is-target-for-replied');
            targetElement.addEventListener('animationend', () => {
              targetElement.classList.remove('is-target-for-replied');
              setTimeout(() => {
                const htmlTargetPointerElement =
                  OTOStore.scrollerElement.$el.children[1].querySelector(
                    `#chat-oto-${targetIdToObservEndPointer}`,
                  );
              }, 0);
            });
          }, 0);
        }
      });
    }, 0);
  });
};
const openContactProfileModal = () => {
  requestAnimationFrame(async () => {
    const modal = await modalController.create({
      component: ProfileContactModal,
      componentProps: {
        userId: props.chatData.chatId,
        name: props.chatData.information.name,
        avatarBackColor: props.chatData.information.avatarClass,
        phoneNumber: props.chatData.information.phoneNumber,
      },
    });

    modal.present();
  });
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
    if (role == 'confirm' || isSingleStateForwarding.value) {
      resetSelectingChat();
    }
  });
};
const prepardDataToScrollTargetMessage = (messageData) => {
  const OTOStore = useOtoStore();
  const repliedTargetId = messageData.repliedData.targetMessageId;
  const indexMessageInList = OTOStore.getCurrentChat.findIndex(
    (e) => e.id == repliedTargetId,
  );
  if (indexMessageInList == -1) {
    const OTOStore = useOtoStore();
    OTOStore.setLoadingStateForRepliedMesage({
      chatId: props.chatData.chatId,
      messageId: messageData.id,
      isLoading: true,
    });
    OTOStore.repliedMessageHandler({
      chatId: props.chatData.chatId,
      targetMessageId: repliedTargetId,
    }).then((result) => {
      nextTick(() => {
        setTimeout(() => {
          nextTick(() => {
            scrollToElement(result);
          });
        }, 0);

        nextTick(() => {
          OTOStore.setLoadingStateForRepliedMesage({
            chatId: props.chatData.chatId,
            messageId: messageData.id,
            isLoading: false,
          });
        });
      });
    });
    return;
  } else {
    nextTick(() => {
      setTimeout(() => {
        nextTick(() => {
          scrollToElement({
            repliedTargetId: repliedTargetId,
            indexMessageInList,
          });
        });
      }, 0);
    });
  }
};
const gettingNextMessagesOfEndPointer = async (messageData) => {
  if (!messageData.endPointerData) return;
  const OTOStore = useOtoStore();
  const { targetMessageIdForNextMessages } = messageData.endPointerData;
  await OTOStore.repliedMessageHandler({
    chatId: props.chatData.chatId,
    targetMessageId: targetMessageIdForNextMessages,
    source: props.chatData.source,
    isEndPointer: true,
  });
  await OTOStore.removeEndPointerProperyOfMessageData({
    targetMessageId: targetMessageIdForNextMessages,
    chatId: props.chatData.chatId,
  });
  delete messageData.endPointerData;
};

const cancelRequestToServer = (messageData) => {
  const fileManagerStore = useFileManagerStore();
  fileManagerStore.cancelRequest(messageData.content);
  const OTOStore = useOtoStore();
  OTOStore.removeMessageLocally({
    chatId: props.chatData.chatId,
    id: messageData.id,
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
  if (OTOStore.chatList[chatId]) {
    const messages = OTOStore.chatList[chatId].messages;
    OTOStore.chatList[chatId].messages = messages.splice(
      messages.length - 50,
      50,
    );
    OTOStore.currentChatId = '';
  }
});
</script>
