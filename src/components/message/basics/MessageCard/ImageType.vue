<template>
  <div
    class="image-container height-width-100"
    :style="{ height: messageData?.dimension?.renderedHeight + 'px' }"
  >
    <img
      class="image-item"
      :key="blobFilePath + 'image-type'"
      :src="blobFilePath"
      @click="showInFullScreen"
    />
    <div
      class="image-skelton-loading height-width-100"
      v-if="!blobFilePath"
    ></div>

    <IonIcon
      @click="cancelingServerRequest"
      class="uploading-icon-file status-icon"
      icon="/Images/tabs/messages/uploading-file-icon.svg"
      color="white"
      v-if="blobFilePath && gettingImageStatus == 'uploading'"
    ></IonIcon>
    <IonIcon
      @click="downloadMainMediaFile"
      class="download-icon-file status-icon"
      icon="/Images/tabs/messages/download-file-icon.svg"
      color="white"
      v-if="blobFilePath && gettingImageStatus == 'requestNotSent'"
    ></IonIcon>
    <IonIcon
      v-if="gettingImageStatus == 'downloading'"
      class="downloading-state-icon status-icon"
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
import { IonIcon, modalController } from '@ionic/vue';
import { ref, defineProps, onMounted, computed, defineEmits } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import FullScreenImageModal from '@/components/message/basics/MessageCard/FullScreenImage.vue';
import TimeAndState from '@/components/message/basics/MessageCard/TimeAndState.vue';
import { useI18n } from 'vue-i18n';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop';

const props = defineProps({
  messageData: {
    type: Object,
    default: () => {
      return {
        id: '',
        itsMe: false,
        type: 'image', // as detecting type for downloading
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

const nestedModalsDesktop = useNestedModalsDesktop();
const emit = defineEmits(['onCancelRequest']);
const { locale } = useI18n();
const blobFilePath = ref();
const mainDownloadState = ref('requestNotSent');
const dirIsLtr = computed(() => {
  if (locale.value == 'fa') {
    return true;
  } else {
    return false;
  }
});

const downloadThumbnailFile = () => {
  const fileManagerStore = useFileManagerStore();
  fileManagerStore
    .handlerForGettingFile(props.messageData.content, 'image', true)
    .then((file) => {
      if (file) {
        blobFilePath.value = file.filePath;
        if (file.itsMain) mainDownloadState.value = 'downloaded';
      }
    });
};

const downloadMainMediaFile = async () => {
  mainDownloadState.value = 'downloading';
  const fileManagerStore = useFileManagerStore();
  const file = await fileManagerStore.handlerForGettingFile(
    props.messageData.content,
    'image',
  );
  blobFilePath.value = file.filePath;
  mainDownloadState.value = 'downloaded';
};
const showInFullScreen = async () => {
  const osWidth = window.screen.width;
  if (mainDownloadState.value != 'downloaded') return;
  if (osWidth > 600) {
    const fullScreenModalData = {
      path: blobFilePath.value,
      id: props.messageData.id,
    };
    nestedModalsDesktop.fullScreenImageDesktop.state = true;
    nestedModalsDesktop.fullScreenImageDesktop.data = fullScreenModalData;
  } else {
    requestAnimationFrame(async () => {
      const modal = await modalController.create({
        component: FullScreenImageModal,
        componentProps: {
          fileData: {
            path: blobFilePath.value,
            id: props.messageData.id,
          },
          dirIsLtr: !dirIsLtr.value,
        },
      });
      modal.present();
    });
  }
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
  setTimeout(() => {
    if (props.messageData.previewState) {
      if (props.messageData.status == 'uploading') {
        mainDownloadState.value = 'uploading';
      } else {
        mainDownloadState.value = 'downloaded';
      }
      blobFilePath.value = props.messageData.previewState;
      return;
    }

    downloadThumbnailFile('image');
  });
});
</script>
<style scoped>
.image-container {
  position: relative;
  overflow: hidden;
}

.image-item {
  width: calc(
    var(--chat-card-size) - var(--mines-chat-card-size) - var(--sidebar-size)
  );
  height: 100%;
  max-height: 40vh;
  opacity: 1;
  object-fit: cover;
  display: block;
}

.image-skelton-loading {
  background-color: var(--card-image-skleton-background);
  position: absolute;
  top: 0;
  left: 0;
}
.image-skelton-loading:after {
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
