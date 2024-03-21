<template>
  <ChatToolbarHeader
    :name="groupNameHandler"
    :avatar="groupAvatarHandler"
    :dirIsLtr="languageIsEnglish"
    avatarClass="avatar-color-5"
    :selectingChatIsActive="selectingChatIsActive"
    @makeVideoCall="makeVideoCall"
    @openProfileModal="openGroupDetail"
    @onForward="openFordadedMessage"
    @onCopy="setCopyToClipboard"
    @resetSelectingChat="resetSelectingChat"
    @back="back"
  />
  <ion-content :scroll-y="false">
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
            :isOnScrollState="onScrollState"
            :isSelected="selectedChatItems[item.id] ? true : false"
            :isSelectState="selectingChatIsActive"
            @click.self="clickEventHandler($event, item)"
            @setSelectedItems="setSelectedItems"
          />
        </KeepAlive>
      </template>
    </DynamicVirtualScroller>
  </ion-content>

  <ChatInput
    @sendMessage="sendMessageHandler"
    @sendVoice="sendVoiceHandler"
    @closeManipulationContainer="replayMessageInformation = null"
    :replayMessageInfo="replayMessageInformation"
  />
</template>

<script setup>
import {
  modalController,
  isPlatform,
  IonContent,
  popoverController,
} from '@ionic/vue';
import { computed, onMounted, ref, nextTick } from 'vue';

import ChatInput from '@/components/message/basics/ChatInput/index.vue';
import groupDeatailAndroid from '@/components/message/groups/android/groupDeatail/index.vue';
import groupDeatailIos from '@/components/message/groups/ios/groupDeatail/index.vue';
import MessageCard from '@/components/message/basics/MessageCard/index.vue';
import DynamicVirtualScroller from '@/components/message/basics/DynamicVirtualScroller/index.vue';
import ForwardedModal from '@/components/message/basics/Forward/index.vue';
import ChatToolbarHeader from '@/components/message/OTO/ChatToolbarHeader.vue';

import { useUserStore } from '@/store/user/user';
import { copyToClipboard } from '@/helpers/browserApis.js';
import { useI18n } from 'vue-i18n';
import { useGroupChat } from '@/store/chats/groupChat';
import { useOverallChatsStore } from '@/store/chats/overall';
import { useVideoCallStore } from '@/store/videoCall/videoCall';
import ContextMenuPopover from '@/components/message/basics/MessageCard/ContextMenuPopover.vue';

const groupChatStore = useGroupChat();
const overallChatsStore = useOverallChatsStore();
const videoCallStore = useVideoCallStore();
const messageCount = ref(0);
const replayMessageInformation = ref(null);
const selectedChatItems = ref({});
const selectingChatIsActive = ref(false);

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

const hasPrevMessages = computed(() => {
  return groupChatStore.getHasPrevMessages;
});

const currentGroup = computed(() => {
  return groupChatStore.currentGroup;
});

const groupNameHandler = computed(() => {
  return currentGroupInfo.value.title;
});

const showLoading = computed(() => {
  return groupChatStore.loading;
});

const currentGroupInfo = computed(() => {
  return groupChatStore.currentGroup;
});

const getMessages = computed(() => {
  return groupChatStore.currentGroup.messages;
});

const isAndroid = computed(() => {
  return isPlatform('android');
});

const preventSendGetMessage = ref(false);
const getPrevMessages = async () => {
  if (preventSendGetMessage.value) return;
  preventSendGetMessage.value = true;
  await groupChatStore.loadPreviouslyMessages();
  preventSendGetMessage.value = false;
};

const groupAvatarHandler = computed(() => {
  if (groupChatStore.currentGroup.avatar) {
    return groupChatStore.currentGroup.avatar;
  }
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
const onScrollState = ref(false);
const setOnScrollState = () => {
  if (onScrollState.value) return;
  onScrollState.value = true;
  setTimeout(() => {
    onScrollState.value = false;
  }, 500);
};
const resetSelectingChat = () => {
  selectingChatIsActive.value = false;
  selectedChatItems.value = {};
};

const openGroupDetail = async () => {
  if (!showLoading.value) {
    const modal = await modalController.create({
      component: isAndroid.value ? groupDeatailAndroid : groupDeatailIos,
    });

    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'cancel') {
    }
  }
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

const sendMessageHandler = (event) => {
  if (event.repliedData) {
    groupChatStore.handleSendMessage(
      event,
      replayMessageInformation.value,
      'replay',
    );
  } else if (event.type == 'image') {
    groupChatStore.handleSendMessage(event, '', 'image');
  } else if (event.type == 'video') {
    groupChatStore.handleSendMessage(event, '', 'video');
  } else if (event.forceFileType == 'file') {
    groupChatStore.handleSendMessage(event, '', 'file');
  } else if (event.type == 'audio') {
    groupChatStore.handleSendMessage(event, '', 'file');
  } else {
    groupChatStore.handleSendMessage(event, '', 'text');
  }
};

const sendVoiceHandler = (event) => {
  groupChatStore.handleSendMessage(event, '', 'audio');
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

const setScrollerElement = (event) => {
  groupChatStore.scrollValue = event;
};

const back = () => {
  overallChatsStore.updateGroupChatRoomBadge(
    groupChatStore.currentGroup.group_id,
  );
  groupChatStore.clearCurrentGroup();
  modalController.dismiss();
  groupChatStore.updateInChatRoomStatus(false);
};

const seenMessage = (event) => {
  const userStore = useUserStore();
  if (event.type) {
    if (
      event.additionalMessageInfo.uuid != userStore.userId &&
      event.status == 'sent'
    ) {
      groupChatStore.seenedMessage(event);
    }
  }
};

onMounted(async () => {
  await groupChatStore.getGroupAvatar(currentGroup.value.group_id);
  await groupChatStore.getGroupMembersUid(currentGroup.value.group_id);
  await groupChatStore.getGroupTitle(currentGroup.value.group_id);
  overallChatsStore.updateGroupChatRoomBadge(
    groupChatStore.currentGroup.group_id,
  );
  messageCount.value = 50;
  await groupChatStore.loadedCurrentGroupMessages(
    currentGroup.value.group_id,
    messageCount.value,
  );
  groupChatStore.getFirstMessageId();
  groupChatStore.checkActiveCall();
  if (groupChatStore.currentGroup.messages[0].type == 'notify.crt') {
    groupChatStore.getHasPrevMessages = false;
  } else {
    groupChatStore.getHasPrevMessages = true;
  }
});

const makeVideoCall = () => {
  videoCallStore.makeConferenceInGroup();
};
</script>
