<template>
  <div class="calling-container">
    <ion-icon
      :icon="close"
      :size="'large'"
      class="pad-on-close"
      @click="modalController.dismiss(null, 'cancel')"
    />

    <div class="callpad-input-container max-width">
      <ion-input
        mode="ios"
        inputmode="none"
        v-model="phoneNumber"
        @ionInput="inputPhoneNumber"
        class="english-font text-white"
        maxlength="12"
        ref="callPadPhoneNumberInputInCalling"
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
</template>
<script setup>
import { IonIcon, IonInput, modalController } from '@ionic/vue';
import NumbersPad from '@/components/callpad/NumbersPad.vue';
import { close } from 'ionicons/icons';
import RemoveIcon from '@/components/callpad/RemoveCharsButton.vue';
import { ref, computed, watch } from 'vue';
import { useCallStore } from '@/store/call/call';

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
ion-icon {
  width: 20px;
  height: 20px;
}
.max-width {
  max-width: 320px;
}
ion-input {
  font-size: calc(38px - 2vw);
  font-weight: 500;
  text-align: center;
}
.pad-on-close {
  position: absolute;
  top: 10vw;
  right: 10vw;
  color: var(--ion-color-white);
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
