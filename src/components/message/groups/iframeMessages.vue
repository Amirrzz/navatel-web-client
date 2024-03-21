<template>
  <ChatToolbarHeader
    :name="groupNameHandler"
    :avatar="groupAvatarHandler"
    :dirIsLtr="languageIsEnglish"
    avatarClass="avatar-color-5"
    :selectingChatIsActive="selectingChatIsActive"
    @openProfileModal="openGroupDetail"
    @onForward="openFordadedMessage"
    @onCopy="setCopyToClipboard('collectionOfMessage')"
    @resetSelectingChat="resetSelectingChat"
    @back="back"
  />
  <DynamicVirtualScroller
    :list="getMessages"
    :scrollerClasses="['scroller', 'messages-container', 'iframe-messages']"
    :showLoading="showLoading"
    :minItemSize="60"
    @setScrollerElement="setScrollerElement"
  >
    <template v-slot:item="{ item, index, active }">
      <KeepAlive>
        <MessageCard
          :key="'chat-oto-' + item.id + '-' + index"
          :id="`chat-oto-${item.id}`"
          :index="`chat-oto-${item.id}`"
          :messageData="item"
          name=""
          chatType="group"
          :isSelected="selectedChatItems[item.id] ? true : false"
          :isSelectState="selectingChatIsActive"
          @click.self="setSelectedItems(item)"
          @setSelectedItems="setSelectedItems"
          @onReply="replayedMessage($event)"
          @onCopy="setCopyToClipboard"
        />
      </KeepAlive>
          <!-- :name="item.additionalMessageInfo.ext_data" -->
    </template>
  </DynamicVirtualScroller>

  <ChatInput
    @sendMessage="sendMessageHandler"
    @sendVoice="sendVoiceHandler"
    @closeManipulationContainer="replayMessageInformation = null"
    :replayMessageInfo="replayMessageInformation"
  />
</template>

<script setup>
import { modalController, isPlatform } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';

import ChatInput from '@/components/message/iframe/ChatInput.vue';
import groupDeatailAndroid from '@/components/message/groups/android/groupDeatail/index.vue';
import groupDeatailIos from '@/components/message/groups/ios/groupDeatail/index.vue';
import MessageCard from '@/components/message/iframe/MessageCard/index.vue';
import DynamicVirtualScroller from '@/components/message/basics/DynamicVirtualScroller/index.vue';
import ForwardedModal from '@/components/message/basics/Forward/index.vue';
import ChatToolbarHeader from '@/components/message/iframe/ChatToolbarHeader.vue';

import { copyToClipboard } from '@/helpers/browserApis.js';
import { useI18n } from 'vue-i18n';
import { useGroupChat } from '@/store/chats/groupChat';
import { useChatInput } from '@/store/chats/chatInput.js';
import { useOverallChatsStore } from '@/store/chats/overall';
import { useVideoCallStore } from '@/store/videoCall/videoCall';

const groupChatStore = useGroupChat();
const chatInputStore = useChatInput();
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

const currentGroup = computed(() => groupChatStore.currentGroup);

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

const groupAvatarHandler = computed(() => {
  if (groupChatStore.currentGroup.avatar) {
    return groupChatStore.currentGroup.avatar;
  }
});

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

onMounted(async () => {
  await groupChatStore.getGroupAvatar(currentGroup.value.group_id);
  await groupChatStore.getGroupMembersUid(currentGroup.value.group_id);
  await groupChatStore.getGroupTitle(currentGroup.value.group_id);
  groupChatStore.checkActiveCall();
  overallChatsStore.updateGroupChatRoomBadge(
    groupChatStore.currentGroup.group_id,
  );
  messageCount.value = 100;
  await groupChatStore.loadedCurrentGroupMessages(
    currentGroup.value.group_id,
    messageCount.value,
  );
});
</script>
