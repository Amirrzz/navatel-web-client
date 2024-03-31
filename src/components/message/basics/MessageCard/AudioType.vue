<template>
  <audio
    v-if="blobFilePath"
    controls
    controlsList="nodownload"
    webkit-playsinline
    playsinline
    preload="none"
    :key="'blobFilePath-1'"
  >
    <source :src="blobFilePath" type="audio/ogg" :key="'blobFilePath-2'" />
    <source :src="blobFilePath" type="audio/mpeg" :key="'blobFilePath-3'" />
    <source :src="blobFilePath" type="audio/wav" :key="'blobFilePath-4'" />
    <source :src="blobFilePath" type="audio/aac" :key="'blobFilePath-5'" />
    <!-- Add AAC format -->
  </audio>
  <audio controls controlsList="nodownload" v-if="!blobFilePath">
    <source src="" />
  </audio>
</template>
<script setup>
import { defineProps, ref, onBeforeMount } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';

const blobFilePath = ref();
const props = defineProps({
  fileId: {
    type: String,
  },
  typeOfAudio: {
    type: String,
    default: 'audio/wav',
  },
});
const downloadMainFile = async () => {
  const fileManagerStore = useFileManagerStore();
  // await fileManagerStore.getAllSystemFiles();
  const file = await fileManagerStore.handlerForGettingFile(
    props.fileId,
    'audio',
  );

  blobFilePath.value = file.filePath;
};
onBeforeMount(() => {
  downloadMainFile();
});
</script>
<style scoped>
audio {
  width: 100%;
}
</style>
