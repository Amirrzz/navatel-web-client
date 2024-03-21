<template>
  <div class="callpad-modal-container slid-up-animation">
    <div class="calling-container">
      <ion-icon
        :icon="close"
        :size="'large'"
        class="pad-on-close"
        @click="emit('close', false)"
      />
      <div class="call-pad-content">
        <div class="callpad-input-container">
          <ion-input
            mode="ios"
            inputmode="none"
            v-model="phoneNumber"
            @ionInput="inputPhoneNumber"
            class="english-font text-white"
            ref="callPadPhoneNumberInputInCalling"
            style="font-size: 20px"
          ></ion-input>
          <RemoveIcon
            v-model:characters="phoneNumber"
            class="md-remove-icon fade-in-animation user-select-none"
            v-show="phoneNumber.length > 0"
          >
            <ion-icon
              slot="icon-only"
              icon="/Images/tabs/call-pad/backspace_ios.svg"
              color="white"
            />
          </RemoveIcon>
        </div>
        <NumbersPad v-model:numbers="phoneNumber" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonIcon, IonInput, modalController } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { ref, computed, watch, defineEmits } from 'vue';
import { useCallStore } from '@/store/call/call';
import RemoveIcon from '@/components/callpad/RemoveCharsButton.vue';
import NumbersPad from '@/components/desktop/call/NumbersPad.vue';

const emit = defineEmits(['close']);
const phoneNumber = ref('');
const callPadPhoneNumberInputInCalling = ref();
const activeSessionId = computed(() => {
  const callStore = useCallStore();
  return callStore.activeReferalCallId || callStore.activeCallId;
});
const inputPhoneNumber = (element) => {
  const value = element.target.value;
  let filtredNumber = value;
  if (/[^0-9#*]/g.test(value)) {
    filtredNumber = value.replace(/[^0-9#*]/g, '');
    callPadPhoneNumberInputInCalling.value.$el.value = filtredNumber;
  }
  phoneNumber.value = filtredNumber;
};
watch(phoneNumber, (number) => {
  if (number) {
    const callStore = useCallStore();
    callStore.sendDTMF(activeSessionId.value, phoneNumber.value);
  }
});
watch(
  activeSessionId,
  () => {
    if (!activeSessionId.value) {
      modalController.dismiss(null, 'cancel');
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.callpad-modal-container {
  direction: ltr;
  position: fixed;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0) !important;
}
.calling-container {
  height: 540px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: end;
  padding: 30px 50px;
  border: 1px solid #9090907b;
  border-radius: 10px;
}

.call-pad-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 30px;
}

.callpad-input-container {
  max-width: 320px;
  padding: 0 50px;
}

ion-icon {
  width: 20px;
  height: 20px;
}
ion-input {
  font-size: calc(38px - 2vw);
  font-weight: 500;
  text-align: center;
}
.pad-on-close {
  color: var(--ion-color-white);
  cursor: pointer;
}
.md-remove-icon {
  position: relative;
  padding: 5px;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}
</style>
