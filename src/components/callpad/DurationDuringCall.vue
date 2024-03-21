<template>
  <div class="duration-container">
    {{ counter.hours }} : {{ counter.minutes }} : {{ counter.seconds }}
  </div>
</template>
<script setup>
import { computed, onMounted, defineProps } from 'vue';
import { useCallStore } from '@/store/call/call';

const connectionInformation = computed(() => {
  const callStore = useCallStore();
  return callStore.getCallModalStatus;
});
const props = defineProps({
  sessionId: {
    type: String,
    required: true,
  },
  isOutGoing: {
    type: String,
    required: true,
  },
});

let sessionId;
const counter = computed(() => {
  const duration = +connectionInformation.value.duration || 0;
  const hours = Math.floor(duration / 3600000)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((duration % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((duration % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return { hours, minutes, seconds };
});
onMounted(() => {
  if (props.isOutGoing) {
    const callStore = useCallStore();
    sessionId = props.sessionId;
    callStore.startDuration(sessionId);
  }
});
</script>
<style scoped>
.duration-container {
  direction: ltr;
  min-width: 93px;
  color: var(--ion-color-white);
}
</style>
