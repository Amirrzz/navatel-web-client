<template>
  <div class="chat-input-container">
    <AttachmentInputs
      v-show="showAttcahmentInputs"
      @selectedFile="setFileForSendMessage"
    ></AttachmentInputs>
    <div
      class="manipulation-message-container slid-up-animation"
      v-if="replayMessageInfo"
    >
      <ion-icon
        :icon="close"
        size="medium"
        @click="emit('closeManipulationContainer')"
        color="dark"
        class="option-button"
      />
      <div class="reply-container">
        <div class="reply-header ellipsis-text">
          {{ replayMessageInfo.name }}
        </div>
        <div
          class="reply-message ellipsis-text"
          v-html="
            replayMessageInfo.type == 'text'
              ? replayMessageInfo.content
              : replayMessageInfo.type
          "
        ></div>
      </div>
      <ion-icon
        icon="/Images/tabs/messages/replay.svg"
        color="dark"
        @click="sendReplayMessage"
        class="option-button"
      ></ion-icon>
    </div>
    <div class="chat-input">
      <div class="chat-items-container">
        <IonIcon
          @click="showEmojy = !showEmojy"
          alt="icon emojie"
          color="black"
          icon="/Images/tabs/emojies.svg"
          v-show="textMessage == ''"
        >
        </IonIcon>

        <input
          ref="textInputMessager"
          class="text-input"
          :class="{
            'ltr-text-input': getTextDirextion?.isRightToLeft === false,
            'rtl-text-input': getTextDirextion?.isRightToLeft,
          }"
          v-model="textMessage"
          placeholder="پیام خود را بنویسید"
          @keyup.enter="sendMessage"
          inputmode="text"
        />

        <IonIcon
          @click="sendMessage"
          alt="icon secnd message file"
          color="black"
          icon="/Images/tabs/send-message-blue.svg"
          class="margin-auto"
          v-show="textMessage != ''"
        ></IonIcon>

        <IonIcon
          @click="handlerOpenFileMenu"
          alt="icon attach file"
          color="black"
          icon="/Images/tabs/file.svg"
          v-show="textMessage == ''"
        >
        </IonIcon>
      </div>
    </div>
    <EmojiPicker
      v-show="showEmojy"
      @update="addEmojiToTextMessage"
    ></EmojiPicker>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from 'vue';
import { IonIcon } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { detectTextDirection } from '@/helpers/textFormatter.js';
import AttachmentInputs from '@/components/message/basics/ChatInput/AttachmentInputs.vue';
import EmojiPicker from '@/components/message/basics/ChatInput/EmojiPicker.vue';
import { useI18n } from 'vue-i18n';
import { getPlatforms } from '@ionic/vue';
import { detectReplyMessageType } from '@/helpers/chatMessageParser.js';

const { t } = useI18n();
const emit = defineEmits([
  'sendMessage',
  'edit',
  'replay',
  'sendImage',
  'sendVoice',
  'closeManipulationContainer',
]);
const textInputMessager = ref();
const props = defineProps({
  replayMessageInfo: {
    default: null,
  },
});

const textMessage = ref('');
const showEmojy = ref(false);
const showAttcahmentInputs = ref(false);

const getTextDirextion = computed(() => {
  if(textMessage.value) {
    return detectTextDirection(textMessage.value);
  } else {
    let direction = {
      isRightToLeft: true
    }
    return direction
  }
});

const handlerOpenFileMenu = () => {
  showAttcahmentInputs.value = !showAttcahmentInputs.value;
};
const sendMessage = () => {
  textInputMessager.value.focus();
  if (textMessage.value.trim() == '' || textMessage.value.trim().length == 0)
    return;
  if (props.replayMessageInfo) return sendReplayMessage();
  emit('sendMessage', {
    text: textMessage.value,
    textDirectionIsRtl: getTextDirextion.value?.isRightToLeft,
  });
  textMessage.value = '';
};
const sendReplayMessage = () => {
  const isText = props.replayMessageInfo.type == 'text';

  const data = {
    text: textMessage.value,
    textDirectionIsRtl: getTextDirextion.value?.isRightToLeft,
    repliedData: {
      ext_data: {
        ReplyFromId: props.replayMessageInfo.additionalMessageInfo.chatId,
        ReplyFromName: props.replayMessageInfo.name,
        replyDescription: isText ? props.replayMessageInfo.content : '',
        replyMsgId: props.replayMessageInfo.id,
        replyFileId: isText ? '' : props.replayMessageInfo.content,
        replyType: detectReplyMessageType(props.replayMessageInfo.type),
      },
    },
  };
  emit('sendMessage', data);
  emit('closeManipulationContainer');
  textMessage.value = '';
};
const setFileForSendMessage = (data) => {
  emit('sendMessage', data);
  showAttcahmentInputs.value = false;
  return;
};

const addEmojiToTextMessage = (emoji) => {
  textMessage.value += emoji;
};
</script>

<style scoped>
.chat-items-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
}
.chat-items-container ion-icon {
  width: calc(28px - 1vw);
  height: calc(28px - 1vw);
}
.margin-auto {
  margin: auto;
}
.send-icon {
  width: 35px;
  height: 35px;
  z-index: 3;
}
.chat-input-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  bottom: 0;
  background-color: #fff;
}
.chat-input {
  height: 30px;
  width: 96%;
  display: flex;
  align-items: center;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  margin: 0 auto 5px auto;
  background-color: #d9d9d9;
  border-radius: 50px;
}
.text-input {
  width: 77%;
  height: 100%;
  border: none;
  outline: none;
  background: #d9d9d9;
  margin: 0 5px;
  color: var(--ion-color-black);
}
.ltr-text-input {
  text-align: left;
  direction: ltr;
}
.rtl-text-input {
  text-align: right;
  direction: rtl;
}
.manipulation-message-container {
  height: 7vh;
  width: 100%;
  display: flex;
  align-items: center;
  background: var(--ion-color-bg-input);
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 10px;
  gap: 10px;
  z-index: 2;
}
.reply-container {
  width: 80%;
}
.option-button {
  width: 10%;
}
</style>
