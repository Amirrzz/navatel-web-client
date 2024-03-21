<template>
  <div
    v-if="props.messageData.type == 'missCall'"
    class="card-calltype-container"
  >
    <CallType :date="messageData.date"></CallType>
  </div>

  <div
    v-else
    class="card-message"
    :class="{
      'me-card-message': messageData.itsMe,
      'is-selected-card': isSelected,
      'show-select-option': isSelectState,
    }"
    ref="targetContextMenuEvent"
    @contextmenu="preventOpenMenu"
  >
    <div
      class="card-message-container"
      :class="{
        'is-my-self-container': messageData.itsMe,
        'size-for-audio-container': messageData.type == 'audio',
        'group-card-message-container':
          messageData.additionalMessageInfo.userInformation,
      }"
      @click="emitToSetSelectedItems"
    >
      <div class="header-parts">
        <TimeAndState
          v-if="!['image', 'video'].includes(messageData.type)"
          :date="messageData.date"
          :itsMe="messageData.itsMe"
          :status="messageData.status"
          :name="name"
        ></TimeAndState>
        
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
          :name="name"
        ></ReplyType>
      </div>
      <!--  -->
      <ImageType
        v-if="messageData.type == 'image'"
        :messageData="messageData"
      ></ImageType>
      <!--  -->
      <VideoType
        v-if="messageData.type == 'video'"
        :messageData="messageData"
      ></VideoType>
      <!--  -->
      <AudioType
        v-if="messageData.type == 'audio'"
        :fileId="messageData.content"
      >
      </AudioType>
      <!--  -->
      <FileType
        v-if="messageData.type == 'file'"
        :fileInfo="{
          ...messageData.additionalMessageInfo,
          content: messageData.content,
        }"
        class="file-container"
      ></FileType>
      <!--  -->
      <TextType
        v-if="messageData.type == 'text'"
        :messageData="messageData"
      ></TextType>
    </div>
    <UserAvatar
      v-if="
        !messageData.itsMe && messageData.additionalMessageInfo.userInformation
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
</template>

<script setup>
import { popoverController, IonIcon } from '@ionic/vue';
import { ref, defineProps, defineEmits } from 'vue';
import TimeAndState from '@/components/message/iframe/MessageCard/TimeAndState.vue';
import CallType from '@/components/message/basics/MessageCard/CallType.vue';
import ImageType from '@/components/message/basics/MessageCard/ImageType.vue';
import VideoType from '@/components/message/basics/MessageCard/VideoType.vue';
import AudioType from '@/components/message/basics/MessageCard/AudioType.vue';
import FileType from '@/components/message/basics/MessageCard/FileType.vue';
import TextType from '@/components/message/basics/MessageCard/TextType.vue';
import ReplyType from '@/components/message/basics/MessageCard/ReplyType.vue';
import ForwardType from '@/components/message/basics/MessageCard/ForwardType.vue';
import ContextMenuPopover from '@/components/message/basics/MessageCard/ContextMenuPopover.vue';
import UserAvatar from '@/components/message/basics/MessageCard/UserAvatar.vue';

import { onLongPress } from '@vueuse/core';
import { checkmarkCircle } from 'ionicons/icons';

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
const emit = defineEmits([
  'onReply',
  'onCopy',
  'onForward',
  'onRemove',
  'onScrollToTargetChat',
  'setActiveSelectState',
  'setSelectedItems',
]);

const openContextMenu = async (event) => {
  event.preventDefault();
  if (props.isSelectState) return;
  const popover = await popoverController.create({
    component: ContextMenuPopover,
    event: event,
  });
  await popover.present();

  const { data, role } = await popover.onDidDismiss();
  if (role == 'confirm') {
    emit(data, props.messageData);
  }
};
const preventOpenMenu = (event) => {
  event.preventDefault();
};
const handlerForScrollTarget = () => {
  if (!props.isSelectState)
    emit('onScrollToTargetChat', props.messageData.repliedData.targetMessageId);
};
const emitToSetSelectedItems = () => {
  if (props.isSelectState) emit('setSelectedItems', props.messageData);
};
const targetContextMenuEvent = ref(null);
onLongPress(targetContextMenuEvent, openContextMenu, {
  modifiers: {
    prevent: false,
  },
});
</script>

<style scoped>
.card-message-container {
  --card-container-background: var(--ion-color-bg-input);
  --card-container-color: var(--ion-color-dark);
  --card-forwarded-color: var(--ion-color-primary-shade);
  --card-replied-background: #0066ff1a;
  --card-replied-color-user: var(--ion-color-primary);
  --card-replied-color-message: var(--ion-color-secondary);
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
.card-message {
  display: flex;
  justify-content: flex-end;
  flex-direction: row-reverse;
  align-items: center;
  padding: 5px 0;
  transition: 0.3s;
  transform: translateX(-30px);
}
.me-card-message {
  justify-content: flex-end;
  flex-direction: row;
  transform: translateX(30px);
  transition: 0.3s;
}
.show-select-option {
  transform: translateX(0px);
}

.card-message-container {
  min-height: 45px;
  max-width: 80vw;
  min-width: 50px;
  color: var(--ion-color-black);
  padding: 5px;
  border-radius: 15px;
  border-bottom-left-radius: 0;
  font-size: 15px;
  position: relative;
}

.group-card-message-container {
  max-width: calc(80vw - 50px);
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
  width: 70vw;
}
.ios .size-for-audio-container {
  width: 70vw;
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
</style>
