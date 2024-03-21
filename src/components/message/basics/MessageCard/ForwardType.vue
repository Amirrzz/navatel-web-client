<template>
  <div class="is-forwarded column-flex mb-5">
    <span class="is-forwarded-user ellipsis-text">{{
      t('tabs.message.chatCard.isForwarded')
    }}</span>
    <span class="is-forwarded-message ellipsis-text">{{ name }}</span>
  </div>
</template>
<script setup>
import { ref, defineProps, onMounted } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  forwardedData: {
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
    props.forwardedData.replyFileId,
    type,
    true,
  );
  blobFilePath.value = file.filePath;
};
onMounted(() => {
  if (props.forwardedData.renderReplyType == 'image') {
    downloadThumbnailFile();
  }
});
</script>
<style scoped>
.is-forwarded {
  height: 50px;
  overflow: hidden;
  padding: 5px;
  font-size: 10px;
  justify-content: space-between;
}
.font-farsi .is-forwarded {
  direction: rtl;
}
.is-forwarded-user {
  color: var(--card-replied-color-user);
  min-width: max-content;
}
.is-forwarded-message {
  color: var(--card-replied-color-message);
}
</style>
