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
      <div class="voice-recorder-container" v-show="showRecorder">
        <div class="send-voice-btn">
          <img
            src="/Images/tabs/stop-red.svg"
            alt="icon"
            class="stop-recorder-btn"
            loading="lazy"
            @click="cancelVoiceRecordingProccess"
          />
          <img
            src="/Images/tabs/send-message-white.svg"
            alt="icon"
            class="send-icon"
            @click="stopRecordingVoice"
            loading="lazy"
          />
          <div class="recorder-animate"></div>
          <div class="blue-background-color"></div>
        </div>
        <div class="timer-container">
          <IonIcon
            icon="/Images/tabs/delete-red.svg"
            color="danger"
            alt="trash bin icon"
            @click="cancelVoiceRecordingProccess"
          />
          <div class="timer">
            <span>{{ handleRecordVoiceTimer.hours }} : </span>
            <span>{{ handleRecordVoiceTimer.minutes }} : </span>
            <span>
              {{ handleRecordVoiceTimer.seconds }}
            </span>
          </div>
        </div>
      </div>

      <div class="chat-items-container" v-show="!showRecorder">
        <img
          src="/Images/tabs/emojies.svg"
          alt="emojie icon"
          class="emojies-icon"
          @click="showEmojy = !showEmojy"
        />

        <ion-textarea
          ref="textInputMessager"
          class="text-input"
          :class="{
            'ltr-text-input': getTextDirextion?.isRightToLeft === false,
            'rtl-text-input': getTextDirextion?.isRightToLeft,
          }"
          :placeholder="t('tabs.message.chatInput.message')"
          inputmode="text"
          mode="ios"
          v-model="textMessage"
          @keyup.enter="enterSendMessageHandler"
        ></ion-textarea>

        <img
          src="/Images/tabs/send-message-blue.svg"
          class="send-message-icon"
          alt="Send"
          v-show="textMessage != ''"
          @click="sendMessage"
        />

        <img
          src="/Images/tabs/file.svg"
          v-show="textMessage == ''"
          alt="File"
          @click="handlerOpenFileMenu"
          class="file-icon"
        />

        <img
          src="/Images/tabs/voice.svg"
          alt="Voice"
          v-show="textMessage == ''"
          @click="startRecordVoice"
          class="voice-icon"
          style=""
        />
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
import { IonIcon, IonTextarea } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { detectTextDirection } from '@/helpers/textFormatter.js';
import audioRecorder from '@/helpers/audioRecorder.js';
import AttachmentInputs from '@/components/desktop/message/basics/ChatInput/AttachmentInputs.vue';
import EmojiPicker from '@/components/desktop/message/basics/ChatInput/EmojiPicker.vue';
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
  return detectTextDirection(textMessage.value);
});

const handlerOpenFileMenu = () => {
  showAttcahmentInputs.value = !showAttcahmentInputs.value;
};
const sendMessage = () => {
  textInputMessager.value.$el.setFocus();
  if (textMessage.value.trim() == '' || textMessage.value.trim().length == 0)
    return;
  if (props.replayMessageInfo) return sendReplayMessage();
  emit('sendMessage', {
    text: textMessage.value.trim(),
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
        ReplyFromId: props.replayMessageInfo.targetUserId,
        ReplyFromName: props.replayMessageInfo.targetName,
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

const voiceTimerCounter = ref(null);
let voiceTimerInterval;
let lastDuratuinRecorder = 0;
const startVoiceTimer = () => {
  voiceTimerCounter.value = 0;
  voiceTimerInterval = setInterval(() => {
    voiceTimerCounter.value += 1000;
  }, 1000);
};

const stopVoiceTimer = () => {
  lastDuratuinRecorder = voiceTimerCounter.value;
  voiceTimerCounter.value = 0;
  showRecorder.value = false;
  clearInterval(voiceTimerInterval);
};
const handleRecordVoiceTimer = computed(() => {
  const duration = voiceTimerCounter.value;
  const hours = Math.floor(duration / 3600000)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((duration % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((duration % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return { hours, minutes, seconds };
});

const addEmojiToTextMessage = (emoji) => {
  textMessage.value += emoji;
};

function sendRecordeVoice(audioAsblob) {
  emit('sendVoice', audioAsblob);
}
const startRecordVoice = async () => {
  showEmojy.value = false;
  showAttcahmentInputs.value = false;
  initialRecorder();
};
const showRecorder = ref(false);
function initialRecorder() {
  showRecorder.value = true;
  audioRecorder.start(getPlatforms()).then(() => {
    startVoiceTimer();
  });
}
const stopRecordingVoice = () => {
  stopVoiceTimer();
  audioRecorder.stop().then((audioAsblob) => {
    audioAsblob['duration'] = lastDuratuinRecorder.toString();
    setTimeout(() => {
      sendRecordeVoice(audioAsblob);
    }, 0);
  });
};
const cancelVoiceRecordingProccess = () => {
  stopVoiceTimer();
  audioRecorder.cancel();
};
const enterSendMessageHandler = (event) => {
  const { key, shiftKey, code } = event;
  if ((key == 'Enter' && shiftKey) || code === '') return;
  sendMessage();
};
</script>

<style scoped>
.send-message-icon {
  cursor: pointer;
  width: 17px;
}
.voice-icon {
  cursor: pointer;
  width: 16px;
}
.file-icon {
  cursor: pointer;
  width: 19px;
}
.emojies-icon {
  cursor: pointer;
  width: 20px;
}
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
.voice-recorder-container {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: end;
}

.send-voice-btn {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: calc(85px - 2vw);
  height: calc(85px - 2vw);
  margin-top: -8px;
  margin-right: -15px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100px 90px 0 105px;
}
.recorder-animate {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 100px 90px 0 105px;
  box-shadow: 110px 150px 200px 150px var(--ion-color-primary-tint);
  animation-duration: 1.5s;
  animation-timing-function: ease;
  animation-fill-mode: both;
  animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-name: recorder-animation;
  z-index: 1;
}
.blue-background-color {
  background: var(--ion-color-primary);
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 50% 50% 0% 50%;
  width: 100%;
  height: 100%;
  z-index: 2;
}
@keyframes recorder-animation {
  0% {
    opacity: 0.3;
    transform: scale(0.3);
  }
  100% {
    opacity: 0.7;
    transform: scale(0.5);
  }
}
.margin-auto {
  margin: auto;
}
.timer-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0 10px;
}

.timer {
  padding: 0 15px;
  color: #979191;
  font-size: 14px;
}

.stop-recorder-btn {
  width: 30px;
  height: 30px;
  position: absolute;
  z-index: 3;
  margin-top: -130px;
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
  background-color: var(--ion-color-bg-input);
}
.target-message-container {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 15px;
}
.target-message-container .target-message-info {
  width: 95%;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding: 0 10px;
}
.target-message-info .title {
  font-size: 16px;
  font-weight: 700;
  color: #428cff;
}
.target-message-info .message {
  font-size: 14px;
  font-weight: 600;
}

.chat-input {
  height: 7vh;
  width: 100%;
  display: flex;
  align-items: center;
  background: var(--ion-color-bg-input);
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
  border-top: 0.5px solid var(--ion-color-bg-chat);
}
.text-input {
  width: 95%;
  height: 1vh;
  border: none;
  outline: none;
  margin: 0 5px;
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
