<template>
  <div
    class="is-replied column-flex mb-5"
    :class="{ 'is-replied-loading': repliedData.isLoading }"
  >
    <span class="is-replied-user ellipsis-text">{{ renderName }}</span>
    <span
      v-if="repliedData.renderReplyType != 'image'"
      class="is-replied-message ellipsis-text"
      :class="{
        'text-direction-right': repliedData.textDirectionIsRtl,
        'text-direction-left': repliedData.textDirectionIsRtl === false,
      }"
      v-html="
        repliedData.renderReplyType == 'text'
          ? repliedData.messageText
          : repliedData.renderReplyType
      "
    ></span>
    <div
      v-if="repliedData.renderReplyType == 'image'"
      class="image-replied-container"
    >
      <div class="pre-load-image" v-if="!blobFilePath"></div>
      <img :src="blobFilePath" height="20" width="20" v-if="blobFilePath" />
    </div>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted, computed } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';

const props = defineProps({
  repliedData: {
    type: Object,
  },
  name: {
    type: String,
    default: '',
  },
});
const blobFilePath = ref();
const downloadThumbnailFile = async (type = 'image') => {
  const fileManagerStore = useFileManagerStore();
  const file = await fileManagerStore.handlerForGettingFile(
    props.repliedData.replyFileId,
    type,
    true,
  );
  blobFilePath.value = file.filePath;
};

const renderName = computed(() => {
  if (props.name.ReplyFromName) {
    return props.name.ReplyFromName;
  } else {
    return props.name;
  }
});

onMounted(() => {
  if (props.repliedData.renderReplyType == 'image') {
    downloadThumbnailFile();
  }
});
</script>
<style scoped>
.is-replied {
  height: 50px;
  overflow: hidden;
  padding: 5px;
  padding-left: 9px;
  background-color: var(--card-replied-background);
  font-size: 10px;
  justify-content: space-between;
  border-radius: 5px;
  position: relative;
}
.is-replied::before {
  content: '';
  height: 100%;
  width: 4px;
  background-color: var(--ion-color-primary);
  position: absolute;
  left: 0;
  top: 0;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  transform: translateY(0);
}
.is-replied-loading::before {
  animation-name: reply-loading;
  animation-timing-function: ease;
  animation-fill-mode: backwards;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
@keyframes reply-loading {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
}
.is-replied-user {
  color: var(--card-replied-color-user);
}
.is-replied-message {
  color: var(--card-replied-color-message);
}
.image-replied-container {
  height: 20px;
  width: 20px;
}
.pre-load-image {
  height: 20px;
  width: 20px;
  border: 0.5px groove var(--ion-color-medium);
}
</style>
