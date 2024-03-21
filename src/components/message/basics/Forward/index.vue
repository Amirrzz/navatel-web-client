<template>
  <HeaderForwarded></HeaderForwarded>
  <div
    v-bind="containerProps"
    class="list-container recently-messages-container"
  >
    <div v-bind="wrapperProps">
      <SavedMessage
        @click="
          selectedTargetChatHandler({
            chatId: currentUserId,
          })
        "
      >
        <template #checkmark>
          <div
            class="checkmark-container"
            :class="{
              'zoom-in-animate':
                selectedItemsForAnimate.includes(currentUserId),
            }"
          >
            <IonIcon
              :icon="checkmarkCircle"
              color="success"
              size="small"
            ></IonIcon>
          </div>
        </template>
      </SavedMessage>
      <div
        v-for="(item, index) in list"
        :key="index + '-recentMessages'"
        class="list-container-item"
      >
        <div
          v-if="item.data.category && item.data.category == 'recentMessages'"
          class="category-item"
        >
          {{ t('tabs.message.recentMessages') }}
        </div>
        <ChatListItem
          v-else-if="item.data.chatId"
          :item="item.data"
          @getAddionalProfileInfo="handelGettingchatItemData"
          @click="selectedTargetChatHandler(item.data)"
          :useInMessageTab="false"
        >
          <template #checkmark>
            <div
              class="checkmark-container"
              :class="{
                'zoom-in-animate': selectedItemsForAnimate.includes(
                  item.data.chatId,
                ),
              }"
            >
              <IonIcon
                :icon="checkmarkCircle"
                color="success"
                size="small"
              ></IonIcon>
            </div>
          </template>
        </ChatListItem>
        <div
          v-if="
            item.data.category && item.data.category == 'recentMessagesContacts'
          "
          class="category-item item-container set-center"
        >
          {{ t('tabs.contacts.title') }}
        </div>
        <div
          v-else-if="
            item.data.category &&
            item.data.category != 'recentMessagesContacts' &&
            item.data.category != 'inviteContatcsTitle' &&
            item.data.category != 'recentMessages'
          "
          class="firstchar-container category-item"
        >
          {{ item.data.category }}
        </div>
        <NavaPhoneUser
          v-if="item.data.contact_phone"
          :item="item.data"
          class="set-margin"
          @click="selectedTargetChatHandler(item.data)"
        >
          <template #checkmark>
            <div
              class="checkmark-container"
              :class="{
                'zoom-in-animate': selectedItemsForAnimate.includes(
                  item.data.contact_username,
                ),
              }"
            >
              <IonIcon
                :icon="checkmarkCircle"
                color="success"
                size="small"
              ></IonIcon>
            </div>
          </template>
        </NavaPhoneUser>
      </div>
    </div>
  </div>
  <TargetsBox
    :targets="selectedForSendMessage"
    @onSendToTargets="sendMessage"
  ></TargetsBox>
</template>

<script setup>
import { IonIcon, modalController } from '@ionic/vue';
import { ref, computed, defineProps } from 'vue';
import { checkmarkCircle } from 'ionicons/icons';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useVirtualList } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/user/user.js';
import HeaderForwarded from '@/components/message/basics/Forward/Header.vue';
import SavedMessage from '@/components/message/basics/Forward/SavedMessage.vue';
import ChatListItem from '@/components/message/list/ListItem.vue';
import NavaPhoneUser from '@/components/contacts/list/NavaphoneUser.vue';
import TargetsBox from '@/components/message/basics/Forward/TargetsBox.vue';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useGroupChat } from '@/store/chats/groupChat.js';
import { detectReplyMessageType } from '@/helpers/chatMessageParser.js';
import { makeDataModelForForwordMessage } from '@/helpers/grpParser.js';
const props = defineProps({
  messages: {
    type: Object,
  },
});

const { t } = useI18n();
const userStore = useUserStore();
const currentUserId = userStore.userId;
const getForwardedList = computed(() => {
  const overalChatsStore = useOverallChatsStore();
  return overalChatsStore.getForwardedDataList;
});
const { list, containerProps, wrapperProps } = useVirtualList(
  getForwardedList,
  {
    // Keep `itemHeight` in sync with the item's row.
    itemHeight: 65,
    overscan: 10,
  },
);
const selectedItemsForAnimate = ref([]);
const selectedForSendMessage = ref([]);
const selectedTargetChatHandler = (selectedItem) => {
  const targetId = selectedItem.chatId || selectedItem.contact_username;
  if (selectedItemsForAnimate.value.includes(targetId)) {
    const targetIndex = selectedItemsForAnimate.value.findIndex(
      (e) => e == targetId,
    );
    selectedItemsForAnimate.value.splice(targetIndex, 1);
    selectedForSendMessage.value.splice(targetIndex, 1);
  } else {
    selectedItemsForAnimate.value.push(targetId);
    const name =
      selectedItem.name ||
      selectedItem.information.name ||
      selectedItem.groupData.name ||
      '';
    const avatarClass =
      selectedItem.avatarClass ||
      selectedItem.information.avatarClass ||
      selectedItem.groupData.avatarClass;
    selectedForSendMessage.value.push({
      target: selectedItem.groupData ? 'grp' : 'oto',
      targetChatId: targetId,
      name,
      avatarClass,
    });
  }
};

const sendMessage = () => {
  const groupChat = useGroupChat();
  const targetsChat = selectedForSendMessage.value;
  const messages = Object.values(props.messages);

  targetsChat.forEach((targetChat) => {
    if (targetChat.target == 'oto') {
      const otoStore = useOtoStore();
      messages.forEach((messageData) => {
        const forwardFromName =
          messageData?.forwardedData?.forwardFromName || messageData.targetName;
        const data = {
          text: messageData.content,
          chatId: targetChat.targetChatId,
          type: messageData.type,
          textDirectionIsRtl: messageData.textDirectionIsRtl,
          forwardedData: {
            fileData: messageData.additionalMessageInfo,
            ext_data: {
              forwardFromId: messageData.targetUserId,
              forwardFromName: forwardFromName,
              forwardSType: 0,
              forwardMsgId: messageData.id,
            },
          },
        };
        otoStore.sendForwardingData(data);
      });
    } else if (targetChat.target == 'grp') {
      messages.forEach((messageData) => {
        // console.log(
        //   makeDataModelForForwordMessage(messageData, targetChat.targetId),
        // );
        groupChat.forwordedMessage(
          makeDataModelForForwordMessage(messageData, targetChat.targetChatId),
        );
      });
    }
  });
  requestAnimationFrame(() => {
    modalController.dismiss(null, 'confirm');
  });
};

const chatListSentRequestId = [];
const handelGettingchatItemData = async (chatItem) => {
  if (!chatItem.chatId) return;
  if (
    chatListSentRequestId.includes(chatItem.chatId) ||
    ['voicemail', 'web-chat'].includes(chatItem.information.source)
  )
    return;
  chatListSentRequestId.push(chatItem.chatId);
  const contactStore = useContactsStore();
  contactStore.getUserProfile(chatItem.chatId, 'image', true);
};
</script>

<style scoped>
.firstchar-container {
  font-weight: bold;
  font-size: calc(30px - 1vmin);
}
.item-container {
  display: flex;
  align-items: flex-end;
}

.list-container {
  scrollbar-width: none;
  padding-bottom: 30vh;
  height: 100%;
}
.list-container-item {
  height: 65px;
}
.list-container::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none; /* Hide scrollbar in IE, Edge, and Firefox */
}
.set-margin {
  margin: 0 3vmin;
}
.category-item {
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0 1.5vmin;
  font-size: calc(30px - 2vmin);
}
.font-farsi .category-item {
  direction: rtl;
}
.checkmark-container {
  position: absolute;
  left: -6%;
  bottom: -40%;
  z-index: 4;
  animation-fill-mode: both;
  transform: scale(0);
  animation-duration: 0.3s;
}
</style>
<style>
.recently-messages-container .list-container-item .option-item-border {
  border: unset;
}
</style>
