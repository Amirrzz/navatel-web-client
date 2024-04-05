<template>
  <div class="stickers-container slid-up-animation">
    <div class="active-tab-container">
      <div v-if="activeTab == 'emoji'">
        <EmojiPicker
          :hide-group-names="true"
          :disable-sticky-group-names="true"
          :disable-skin-tones="true"
          :hide-search="true"
          class="slid-up-animation"
          :native="true"
          @select="onSelectEmoji"
        />
      </div>
      <div v-if="activeTab == 'stickers'">
        <StickersContent @sendSticker="sendSticker" />
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
import { useI18n } from 'vue-i18n';

import EmojiPicker from 'vue3-emoji-picker';
import StickersContent from '@/components/desktop/message/basics/ChatInput/StickersContent.vue';

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

const sendSticker = (sticker) => {
  console.log(sticker);

  // ----------------------------------------- //
  // ** Send Sticker Data Model For Server ** //
  // --------------------------------------- //

  //   mtype: 'grp.stk',
  //   from: userStore.userId,
  //   id: generateUid(50),
  //   firstChar: userStore.nickname.slice(0, 1).toUpperCase(),
  //   loading: true,
  //   body: {
  //     mtype: 'grp.stk',
  //     edit_state: 0,
  //     data: { fileId: sticker.fileId, ext_data: {} },
  //   },
};
</script>

<style scoped>
.v3-emoji-picker {
  width: 100%;
  border-radius: 0;
  box-shadow: 0 0 0 0;
}
.stickers-container {
  width: calc(100% - 450px);
  height: 360px;
  background: #fff;
  position: fixed;
  z-index: 9999;
  margin-bottom: 450px;
  border-radius: 50px;
  overflow: hidden;
}

.active-tab-container {
  width: 100%;
}

.tabs-container {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  cursor: pointer;
}

.activer-tab {
  background: var(--ion-color-dark);
  color: var(--ion-color-light);
}
</style>
