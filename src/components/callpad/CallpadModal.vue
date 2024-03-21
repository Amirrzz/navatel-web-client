<template>
  <div class="ion-padding callpad-container-during-call">
    <ion-icon
      :icon="close"
      :size="'large'"
      class="pad-on-close"
      @click="modalController.dismiss(null, 'cancel')"
    />

    <div class="numbers-keypad-container">
      <div class="callpad-input-container">
        <ion-input
          mode="ios"
          inputmode="none"
          v-model="phoneNumber"
          @ionInput="inputPhoneNumber"
          class="english-font"
          maxlength="16"
          ref="callPadPhoneNumberInput"
        ></ion-input>
        <RemoveIcon
          v-model:characters="phoneNumber"
          class="md-remove-icon fade-in-animation user-select-none"
          v-if="!isIos && phoneNumber.length > 0"
        >
          <ion-icon
            slot="icon-only"
            icon="/Images/tabs/call-pad/backspace_ios.svg"
            color="white"
          />
        </RemoveIcon>
      </div>

      <NumbersPad v-model:numbers="phoneNumber" />
      <div class="action-buttons">
        <ion-button
          shape="round"
          size="large"
          class="call-button"
          @click="sendNumber"
        >
          <ion-icon slot="icon-only" icon="/Images/tabs/call-pad/phone.svg" />
        </ion-button>
        <span class="remove-icon-container">
          <RemoveIcon
            v-model:characters="phoneNumber"
            class="ios-remove-icon fade-in-animation"
            v-if="isIos && phoneNumber.length > 0"
          >
            <ion-icon
              slot="icon-only"
              icon="/Images/tabs/call-pad/backspace_ios.svg"
              color="white"
            />
          </RemoveIcon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  IonButton,
  IonIcon,
  IonInput,
  isPlatform,
  modalController,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { close } from 'ionicons/icons';
import RemoveIcon from '@/components/callpad/RemoveCharsButton.vue';
import NumbersPad from '@/components/callpad/NumbersPad.vue';
const isIos = computed(() => {
  return isPlatform('ios');
});

const phoneNumber = ref('');
const callPadPhoneNumberInput = ref();

const inputPhoneNumber = (element) => {
  const value = element.target.value;
  if (/[^0-9#*]/g.test(value)) {
    let filtredNumber = value.replace(/[^0-9#*]/g, '');
    phoneNumber.value = filtredNumber;
    callPadPhoneNumberInput.value.$el.value = filtredNumber;
  }
};
// by this functionality you can open calling modal in any where
const sendNumber = async () => {
  modalController.dismiss(
    { name: 'undefined', contact_phone: phoneNumber.value },
    'confirm',
  );
};
</script>
<style scoped>
ion-input {
  font-size: 38px;
  font-weight: 500;
  text-align: center;
}
ion-button::part(native) {
  padding: 12px 50px;
  right: -23px;
}
.md ion-button::part(native) {
  border-radius: 15px;
}
.md-remove-icon {
  position: relative;
  padding: 5px;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.action-buttons {
  margin: 0 auto;
}

.remove-icon-container {
  min-width: 46px;
  display: inline-flex;
  position: relative;
  left: 25%;
  top: 10%;
  padding: 10px;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.callpad-container-during-call {
  height: 90%;
}
.pad-on-close {
  position: absolute;
  top: 10vw;
  right: 10vw;
  color: white;
}
</style>
