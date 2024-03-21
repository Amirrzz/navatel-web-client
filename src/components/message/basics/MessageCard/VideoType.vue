<template>
  <div
    class="video-container"
    :style="{ height: messageData?.dimension?.renderedHeight + 'px' }"
  >
    <img
      class="height-width-100"
      v-if="thumbnailBlobPath && !videoBlobPath"
      :key="thumbnailBlobPath + '-thumbnailBlobPath-'"
      :src="thumbnailBlobPath"
    />
    <video
      controls
      v-if="videoBlobPath"
      :key="videoBlobPath + 'video-tag'"
      class="height-width-100"
    >
      <source :src="videoBlobPath" :key="videoBlobPath + '-vedio-src'" />
    </video>
    <IonIcon
      @click="cancelingServerRequest"
      class="uploading-icon-file status-icon"
      icon="/Images/tabs/messages/uploading-file-icon.svg"
      color="white"
      v-if="gettingImageStatus == 'uploading'"
    ></IonIcon>
    <IonIcon
      @click="downloadMainMediaFile"
      class="download-icon-file status-icon"
      icon="/Images/tabs/messages/download-file-icon.svg"
      color="white"
      v-else-if="thumbnailBlobPath && gettingImageStatus == 'requestNotSent'"
    ></IonIcon>
    <IonIcon
      v-else-if="gettingImageStatus == 'downloading'"
      class="download-icon-file status-icon"
      icon="/Images/tabs/messages/downloading-file-icon.svg"
      color="white"
    ></IonIcon>

    <TimeAndState
      class="state-chat-container-in-image"
      :date="messageData.date"
      :itsMe="messageData.itsMe"
      :status="messageData.status"
    ></TimeAndState>
  </div>
</template>
<script setup>
import { IonIcon } from '@ionic/vue';
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import TimeAndState from '@/components/message/basics/MessageCard/TimeAndState.vue';

const props = defineProps({
  messageData: {
    type: Object,
    default: () => {
      return {
        id: '',
        itsMe: false,
        date: '',
        status: 'sent',
        editedInfo: {
          isEdited: false,
          date: '',
        },
      };
    },
  },
});
const emit = defineEmits(['onCancelRequest']);

const thumbnailBlobPath = ref();
const videoBlobPath = ref();
const mainDownloadState = ref('requestNotSent');

const downloadThumbnailFile = async () => {
  const fileManagerStore = useFileManagerStore();
  const file = await fileManagerStore.handlerForGettingFile(
    props.messageData.content,
    'video',
    true,
  );
  if (file.itsMain) {
    mainDownloadState.value = 'downloaded';
    videoBlobPath.value = file.filePath;
    return;
  }
  thumbnailBlobPath.value = file.filePath;
};
const downloadMainMediaFile = async () => {
  mainDownloadState.value = 'downloading';
  const fileManagerStore = useFileManagerStore();
  const file = await fileManagerStore.handlerForGettingFile(
    props.messageData.content,
    'video',
  );
  mainDownloadState.value = 'downloaded';
  videoBlobPath.value = URL.createObjectURL(file.mainFile);
};
const cancelingServerRequest = () => {
  emit('onCancelRequest');
};
const gettingImageStatus = computed(() => {
  if (props.messageData.previewState) {
    if (props.messageData.status == 'uploading') {
      return 'uploading';
    } else {
      return mainDownloadState.value;
    }
  }
  return mainDownloadState.value;
});
onMounted(() => {
  if (props.messageData.previewState) {
    if (props.messageData.status == 'uploading') {
      mainDownloadState.value = 'uploading';
    } else {
      mainDownloadState.value = 'downloaded';
    }
    videoBlobPath.value = props.messageData.previewState;
    return;
  }
  downloadThumbnailFile();
});
</script>
<style scoped>
video {
  width: 100%;
}
.video-container {
  position: relative;
  overflow: hidden;
  margin-bottom: 5px;
  min-width: calc(
    var(--chat-card-size) - var(--mines-chat-card-size) - var(--sidebar-size) -
      17px
  );
}
.video-item-show {
  opacity: 1;
}

.video-skelton-loading {
  background-color: var(--card-image-skleton-background);
  position: absolute;
  top: 0;
  left: 0;
}
.video-skelton-loading:after {
  content: '';
  height: 100%;
  width: 50%;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate3d(-100%, 0, 0);
  background-color: var(--card-image-skleton-loader);
  animation-name: skleton-rolling;
  animation-fill-mode: both;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
}
@keyframes skleton-rolling {
  0% {
    transform: translate3d(-100%, 0, 0);
  }
  100% {
    transform: translate3d(200%, 0, 0);
  }
}

.status-icon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.download-icon-file {
  background-color: var(--card-time-color-in-image);
}
</style>
