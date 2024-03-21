<template>
  <div
    class="text-message"
    :class="{
      'text-direction-right': messageData.textDirectionIsRtl,
      'font-farsi': messageData.textDirectionIsRtl,
      'text-direction-left': !messageData.textDirectionIsRtl,
    }"
  >
    <span v-html="getTextContent" class="text-content"></span>
    <span
      class="read-more-style"
      v-if="isReadMore"
      @click="handleReadMoreText"
      >{{ t('tabs.message.readMore') }}</span
    >
  </div>
</template>
<script setup>
import { ref, computed, onMounted, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  messageData: {
    type: Object,
  },
});
const isReadMore = ref(false);
const getTextContent = computed(() => {
  if (isReadMore.value) {
    return props.messageData.content.slice(0, 300);
  } else {
    return props.messageData.content;
  }
});
const handleReadMoreText = () => {
  isReadMore.value = false;
};
onMounted(() => {
  if (props.messageData.content?.length > 300) {
    isReadMore.value = true;
  }
});
</script>
<style scoped>
.text-message {
  min-height: 22px;
}
.text-content {
  white-space: break-spaces;
}
.read-more-style {
  min-height: 22px;
  color: var(--ion-color-primary);
}
</style>
