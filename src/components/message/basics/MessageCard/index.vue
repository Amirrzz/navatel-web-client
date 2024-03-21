<template>
  <span
    v-if="
      messageData.type.split('.')[0] == 'notify' ||
      messageData.type == 'missCall'
    "
  >
    <div v-if="messageData.type == 'missCall'" class="card-calltype-container">
      <CallType :date="messageData.date"></CallType>
    </div>
    <div v-if="messageData.type.split('.')[0] == 'notify'">
      <NotifType :source="messageData" />
    </div>
  </span>
  <div
    v-else
    class="base-card-container"
    :class="{
      'is-selected-card': isSelected,
      'show-select-option': isSelectState,
      'me-base-card-container': messageData.itsMe,
    }"
    @click.self="clickEventHandler"
  >
    <div
      class="card-message"
      :class="{
        'me-card-message': messageData.itsMe,
      }"
      @mousedown="startLongPress"
      @mouseup="endLongPress"
      @touchstart.passive="startLongPress"
      @touchend.passive="endLongPress"
    >
      <div
        class="card-message-container"
        :class="{
          'is-my-self-container': messageData.itsMe,
          'size-for-audio-container': messageData.type == 'audio',
          'group-card-message-container':
            messageData.additionalMessageInfo?.userInformation,
        }"
        @click="emitToSetSelectedItems"
      >
        <span
          class="sender-message-name"
          v-if="chatType == 'group' && !messageData.itsMe"
          >{{ senderMessageName }}</span
        >
        <div class="header-parts">
          <!-- Is Forwarded Part -->
          <ForwardType
            v-if="messageData.forwardedData"
            :forwardedData="messageData.forwardedData"
            :name="messageData.forwardedData.forwardFromName"
          >
          </ForwardType>
          <!-- Is Replied Part -->
          <ReplyType
            @click="handlerForScrollTarget"
            v-if="messageData.repliedData"
            :repliedData="messageData.repliedData"
            :name="messageData.repliedData.replyFromName"
          ></ReplyType>
        </div>
        <!--  -->
        <ImageType
          v-if="messageData.type == 'image'"
          :messageData="messageData"
          @onCancelRequest="emitCancelRequest"
        ></ImageType>
        <!--  -->
        <VideoType
          v-if="messageData.type == 'video'"
          :messageData="messageData"
          @onCancelRequest="emitCancelRequest"
        ></VideoType>
        <!--  -->
        <AudioType
          v-if="messageData.type == 'audio'"
          :fileId="messageData.content"
          :typeOfAudio="messageData.additionalMessageInfo.type"
        >
        </AudioType>
        <!--  -->
        <FileType
          v-if="messageData.type == 'file'"
          :fileInfo="{
            ...messageData.additionalMessageInfo,
            content: messageData.content,
            status: messageData.status,
          }"
          class="file-container"
          @onCancelRequest="emitCancelRequest"
        ></FileType>
        <!--  -->
        <TextType
          v-if="messageData.type == 'text'"
          :messageData="messageData"
        ></TextType>
        <TimeAndState
          v-if="!['image', 'video'].includes(messageData.type)"
          :date="messageData.date"
          :itsMe="messageData.itsMe"
          :status="messageData.status"
        ></TimeAndState>
      </div>
      <UserAvatar
        v-if="
          !messageData.itsMe &&
          messageData.additionalMessageInfo &&
          messageData.additionalMessageInfo.userInformation
        "
        :chatType="chatType"
        :dataSource="messageData.additionalMessageInfo.userInformation"
      />
      <div class="select-chat-container" @click="emitToSetSelectedItems">
        <div class="default-circle"></div>
        <IonIcon
          :icon="checkmarkCircle"
          color="success"
          class="checkmark-icon"
          :class="{ 'checkmark-icon-active': isSelected }"
        ></IonIcon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue';
import { defineProps, defineEmits, onMounted, computed } from 'vue';
import { checkmarkCircle } from 'ionicons/icons';

import NotifType from '@/components/message/basics/MessageCard/NotifType.vue';
import TimeAndState from '@/components/message/basics/MessageCard/TimeAndState.vue';
import CallType from '@/components/message/basics/MessageCard/CallType.vue';
import ImageType from '@/components/message/basics/MessageCard/ImageType.vue';
import VideoType from '@/components/message/basics/MessageCard/VideoType.vue';
import AudioType from '@/components/message/basics/MessageCard/AudioType.vue';
import FileType from '@/components/message/basics/MessageCard/FileType.vue';
import TextType from '@/components/message/basics/MessageCard/TextType.vue';
import ReplyType from '@/components/message/basics/MessageCard/ReplyType.vue';
import ForwardType from '@/components/message/basics/MessageCard/ForwardType.vue';
import UserAvatar from '@/components/message/basics/MessageCard/UserAvatar.vue';

const props = defineProps({
  chatType: {
    type: String,
    default: '',
  },
  messageData: {
    type: Object,
    default: () => {
      return {
        id: '',
        itsMe: false,
        type: 'text', // as detecting type for downloading
        content: '',
        date: '',
        status: 'sent',
        editedInfo: {
          isEdited: false,
          date: '',
        },
        textDirectionIsRtl: null,
        imageHeight: null,
      };
    },
  },
  name: {
    type: String,
    default: '',
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isSelectState: {
    type: Boolean,
    default: false,
  },
});

const senderMessageName = computed(() => {
  const userInformation =
    props.messageData?.additionalMessageInfo?.userInformation;
  if (!userInformation) return '';
  return userInformation.name || userInformation.nickname || '';
});

const emit = defineEmits([
  'onParentClick',
  'onReply',
  'onCopy',
  'onForward',
  'onRemove',
  'onEndPointer',
  'onScrollToTargetChat',
  'onCancelRequest',
  'setActiveSelectState',
  'setSelectedItems',
  'seenMessage',
]);

const clickEventHandler = (event) => {
  emit('onParentClick', {
    event,
    messageData: props.messageData,
  });
};

const preventOpenMenu = (event) => {
  event.preventDefault();
};
const handlerForScrollTarget = () => {
  if (!props.isSelectState) emit('onScrollToTargetChat', props.messageData);
};
const initialSelectedItem = () => {
  emitToSetSelectedItems('init');
};
const emitToSetSelectedItems = (state) => {
  if (props.isSelectState || state == 'init')
    emit('setSelectedItems', props.messageData);
};
const emitCancelRequest = () => {
  emit('onCancelRequest', props.messageData);
};
let timer = 0;
const startLongPress = (item) => {
  timer = setTimeout(() => {
    emitToSetSelectedItems('init');
    // Do whatever action you want on long press
  }, 750); // Adjust the duration as needed
};
const endLongPress = () => {
  clearTimeout(timer);
};

onMounted(() => {
  emit('seenMessage', props.messageData);
  if (props.messageData.endPointerData) {
    emit('onEndPointer', props.messageData);
  }
});
</script>

<style scoped>
.card-message-container {
  --card-container-background: var(--ion-color-bg-input);
  --card-container-color: var(--ion-color-dark);
  --card-forwarded-color: var(--ion-color-primary-shade);
  --card-replied-background: #0066ff1a;
  --card-replied-color-user: var(--ion-color-primary);
  --card-replied-color-message: var(--ion-color-primary-shade);
  --card-image-skleton-background: #d8d8d8;
  --card-image-skleton-loader: #f3f3f375;
  --card-time-color: var(--ion-color-medium);
  --card-time-color-in-image: #292525;
}
.is-my-self-container {
  --card-container-background: var(--ion-color-success-tint);
  --card-container-color: var(--ion-color-black);
  --card-forwarded-color: var(--ion-color-primary-shade);
  --card-replied-background: var(--ion-color-success);
  --card-replied-color-user: var(--ion-color-primary);
  --card-replied-color-message: var(--ion-color-primary-shade);
  --card-image-skleton-background: #bce7e2;
  --card-image-skleton-loader: #b4ffbe70;
  --card-time-color: var(--ion-color-medium);
  --card-time-color-in-image: #292525;
}
.card-calltype-container {
  padding: 5px 0;
}
.base-card-container {
  transition: 0.5s;
  position: relative;
  display: flex;
}
.me-base-card-container {
  justify-content: flex-end;
}
.card-message {
  display: flex;
  justify-content: flex-end;
  flex-direction: row-reverse;
  align-items: center;
  padding: 5px 0;
  transition: 0.3s;
  transform: translateX(-30px);
  width: calc(100% - 45px);
  max-width: max-content;
}
.me-card-message {
  flex-direction: row;
  transform: translateX(30px);
  transition: 0.3s;
}
.show-select-option .card-message,
.show-select-option .me-card-message {
  transform: translateX(0);
}

.card-message-container {
  min-height: 45px;
  max-width: calc(
    var(--chat-card-size) - var(--mines-chat-card-size) - var(--sidebar-size)
  );
  min-width: 50px;
  background-color: var(--card-container-background);
  color: var(--card-container-color);
  padding: 5px;
  border-radius: 15px;
  border-bottom-left-radius: 0;
  font-size: 15px;
  position: relative;
  cursor: pointer;
}

.is-selected-card {
  background-color: #428cff33;
}
.is-target-for-replied::after {
  content: '';
  width: calc(100% + 30px);
  height: calc(100% + 2.5px);
  position: absolute;
  top: -1.25px;
  background-color: #428cff33;
  animation-duration: 2s;
  animation-timing-function: ease-out;
  animation-name: heart-beat;
  animation-direction: normal;
  z-index: -1;
  animation-fill-mode: both;
}
@keyframes heart-beat {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.is-my-self-container {
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 0;
}

/* Header Parts Start  */

.is-forwarded {
  font-size: 10px;
  color: var(--card-forwarded-color);
}

/* Header Parts end  */

/* Content Part Start */

.size-for-audio-container {
  width: calc(
    var(--chat-card-voice-size) - var(--mines-chat-card-size) -
      var(--sidebar-size)
  );
}
.ios .size-for-audio-container {
  width: calc(
    var(--chat-card-voice-size) - var(--mines-chat-card-size) -
      var(--sidebar-size)
  );
}

/* Content Part End */
/* helper css Classes  */
.column-flex {
  display: flex;
  flex-direction: column;
}
.height-width-100 {
  width: 100%;
  height: 100%;
}
.font-farsi {
  font-family: Yekan Bakh FaNum;
}
.select-chat-container {
  width: 13px;
  height: 13px;
  position: relative;
  margin-left: 16px;
  margin-right: 16px;
}

.default-circle {
  width: 13px;
  height: 13px;
  border: white 1px solid;
  border-radius: 50px;
  animation-fill-mode: both;
  background: var(--ion-color-secondary);
  position: relative;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.checkmark-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: 0.2s;
  opacity: 0;
  /* border: 1px solid white; */
  border-radius: 50%;
  width: 13px;
  height: 13px;
}
.checkmark-icon-active {
  opacity: 1;
  fill: var(--ion-color-success);
}

.sender-message-name {
  color: var(--ion-color-primary);
  font-size: 12px;
}
</style>
