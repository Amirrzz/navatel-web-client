<template>
  <div
    class="text-message"
    :class="{
      'text-direction-right': messageData.textDirectionIsRtl,
      'font-farsi': messageData.textDirectionIsRtl,
      'text-direction-left': !messageData.textDirectionIsRtl,
    }"
  >
    <span class="text-content" v-html="messageData.content"></span>
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
