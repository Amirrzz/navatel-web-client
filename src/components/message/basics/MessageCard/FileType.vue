<template>
  <div class="content">
    <div class="icon-container" @click="downloadRenderedFile">
      <IonIcon
        @click="cancelingServerRequest"
        class="file-download-icon status-icon"
        icon="/Images/tabs/messages/uploading-file-icon.svg"
        color="white"
        v-if="fileInfo.status == 'uploading'"
      ></IonIcon>
      <IonIcon
        class="file-download-icon"
        icon="/Images/tabs/messages/download-file-icon.svg"
        color="white"
        v-else-if="mainDownloadState == 'requestNotSent'"
      ></IonIcon>
      <IonIcon
        v-else-if="mainDownloadState == 'downloading'"
        class="file-download-icon"
        icon="/Images/tabs/messages/downloading-file-icon.svg"
        color="white"
      ></IonIcon>
      <IonIcon
        v-else-if="mainDownloadState == 'downloaded'"
        class="file-download-icon downloaded-icon"
        icon="/Images/tabs/messages/file-sheet.svg"
        color="white"
      ></IonIcon>
    </div>
    <div class="file-detaile">
      <div class="file-name ellipsis-text">
        {{ fileInfo?.name }}
      </div>
      <div class="file-size ellipsis-text">
        {{ fileInfo?.mbSize }}MB
        {{ fileInfo?.renderedType }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { IonIcon } from '@ionic/vue';
import { ref, defineProps, onBeforeMount, defineEmits, nextTick } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { getItemFromIndexDB } from '@/helpers/dbManager';

const props = defineProps({
  fileInfo: {
    type: Object,
    default: () => {
      return {
        id: '',
        name: '',
        mbSize: '',
        renderedType: '',
        fileId: '',
        status: '',
      };
    },
  },
});
const emit = defineEmits(['onCancelRequest']);

const mainDownloadState = ref('requestNotSent');
const blobFilePath = ref(null);
const downloadRenderedFile = async () => {
  if (props.fileInfo.status == 'uploading') return;
  mainDownloadState.value = 'downloading';
  const fileId = props.fileInfo.fileId.split('.')[0];
  const fileManagerStore = useFileManagerStore();
  const file = await fileManagerStore.handlerForGettingFile(fileId, 'file');
  mainDownloadState.value = 'downloaded';

  const link = document.createElement('a');
  link.href = file.filePath;
  link.download = props.fileInfo.name;
  link.click();
};
const fileDownloadStateHandler = async () => {
  await nextTick();
  const fileContent = await getItemFromIndexDB('files', props.fileInfo.fileId);
  if (fileContent) {
    blobFilePath.value = URL.createObjectURL(fileContent.mainFile);
    mainDownloadState.value = 'downloaded';
  }
};

const cancelingServerRequest = () => {
  emit('onCancelRequest');
};
onBeforeMount(() => {
  return;
  fileDownloadStateHandler();
});
</script>
<style scoped>
.content {
  padding: 10px 5px;
}
.file-container {
  display: flex;
  gap: 5px;
  width: 100%;
}
.file-detaile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: calc(100% - 50px);
}
.file-name {
  font-weight: 700;
  font-size: 15px;
  width: 100%;
}
.file-size {
  font-weight: 600;
  color: #999595;
  font-size: 12px;
  width: 100%;
}
.icon-container {
  width: 45px;
  height: 45px;
  min-width: 45px;
  min-height: 45px;
  background-color: var(--ion-color-primary);
  border-radius: 50%;
  position: relative;
}
.file-download-icon {
  width: 102%;
  height: 102%;
}
.downloaded-icon {
  position: absolute;
  width: 80%;
  height: 80%;
  left: 10%;
  top: 10%;
}
</style>
