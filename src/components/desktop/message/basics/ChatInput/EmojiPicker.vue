<template>
  <div class="stickers-container">
    <div class="active-tab-container">
      <EmojiPicker
        :hide-group-names="true"
        :disable-sticky-group-names="true"
        :disable-skin-tones="true"
        :hide-search="true"
        class="slid-up-animation"
        :native="true"
        v-if="activeTab === 'emoji'"
        @select="onSelectEmoji"
      />
      <div v-if="activeTab === 'stickers'">
        <Stickers />
      </div>
    </div>
    <div class="tabs-container">
      <span
        @click="activeTab = 'stickers'"
        class="tab"
        :class="{ 'activer-tab': activeTab === 'stickers' }"
        >{{ t('tabs.message.chatInput.sticker') }}</span
      >
      <span
        @click="activeTab = 'emoji'"
        class="tab"
        :class="{ 'activer-tab': activeTab === 'emoji' }"
        >{{ t('tabs.message.chatInput.emoji') }}</span
      >
    </div>
  </div>
</template>
<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import EmojiPicker from 'vue3-emoji-picker';
import Stickers from '@/components/message/basics/ChatInput/stickers.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update']);
const activeTab = ref('emoji');

const onSelectEmoji = (emoji) => {
  emit('update', emoji.i);
};
</script>
<style scoped>
.v3-emoji-picker {
  width: 100%;
  border-radius: 0;
  box-shadow: 0 0 0 0;
}
.stickers-container {
  width: 100%;
  height: 360px;
  background: var(--ion-color-light);
  animation: 0.3s open-animation;
}

.active-tab-container {
  width: 100%;
  height: 300px;
  border-bottom: 1px solid #c2bdbd;
}

.tabs-container {
  width: 100%;
  height: min-content;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--ion-color-bg-input);
  position: absolute;
  bottom: 0;
  padding: 10px;
}

.tab {
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: var(--ion-color-dark);
  margin: 0 10px;
  padding: 5px 5px;
  border-radius: 30px;
  padding: 5px;
}

.activer-tab {
  background: var(--ion-color-dark);
  color: var(--ion-color-light);
}
</style>
