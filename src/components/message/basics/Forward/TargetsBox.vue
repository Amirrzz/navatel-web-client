<template>
  <div class="sender-box-container">
    <div class="targets-container" ref="scrollArea">
      <div
        class="target fade-animation"
        v-for="(item, index) in targets"
        :key="index + 'chat-forwarded-target'"
      >
        <div class="name">{{ item.name }}</div>
        <div class="avatar" :class="[item.avatarClass]">{{ item.name[0] }}</div>
      </div>
    </div>
    <IonIcon
      @click="sendToTargets"
      alt="icon secnd message file"
      :color="targets.length <= 0 ? 'medium' : 'primary'"
      icon="/Images/tabs/messages/send-message-blue.svg"
      class="margin-auto"
    ></IonIcon>
  </div>
</template>
<script setup>
import { IonIcon } from '@ionic/vue';
import { scrollToRight } from '@/helpers/parser.js';
import { ref, watch, defineEmits, defineProps, onMounted } from 'vue';
const props = defineProps({
  targets: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(['onSendToTargets']);

const sendToTargets = () => {
  if (props.targets.length <= 0) return;
  emit('onSendToTargets');
};

const scrollArea = ref();
watch(props, () => {
  setTimeout(() => {
    scrollToRight(scrollArea.value, 500);
  }, 0);
});
</script>
<style scoped>
.sender-box-container {
  height: 8vh;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--ion-color-bg-input);
  border-top: 0.5px solid var(--ion-color-bg-chat);
  gap: 5px;
  padding: 0 10px;
  padding-left: 0;
}

ion-icon {
  width: calc(28px - 1vw);
  height: calc(28px - 1vw);
}
.targets-container {
  display: flex;
  gap: 5px;
  width: calc(100% - (28px - 1vw));
  overflow: auto;
  padding-left: 5px;
}
.targets-container {
  scrollbar-width: none;
  /* overflow-y: hidden; */
}
.targets-container::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}
.target {
  display: flex;
  align-items: center;
  background-color: var(--ion-color-medium);
  font-size: 12px;
  border-radius: 20px;
  height: 5vh;
  padding: 7px;
  padding-right: 5vh;
  position: relative;
}
.name {
  padding-right: 5px;
  min-width: max-content;
}
.avatar {
  height: 5vh;
  width: 5vh;
  color: white;
  border-radius: 50%;
  position: absolute;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
}
</style>
