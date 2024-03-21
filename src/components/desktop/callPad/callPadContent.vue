<template>
  <div class="callpad-container-during-call">
    <div class="numbers-keypad-container">
      <div class="callpad-input-container" dir="ltr">
        <div class="add-contact">
          <img
            src="/Images/tabs/plus.svg"
            alt="icon"
            v-if="addContactState"
            @click="addContact"
          />
        </div>
        <div class="input-content">
          <ion-input
            mode="ios"
            inputmode="none"
            v-model="phoneNumber"
            @ionInput="inputPhoneNumber"
            class="english-font"
            maxlength="16"
            ref="callPadPhoneNumberInput"
            style="font-size: 26px"
            autofocus="“true”"
          ></ion-input>
        </div>

        <div class="remove-content">
          <RemoveIcon
            v-model:characters="phoneNumber"
            class="md-remove-icon fade-in-animation user-select-none"
            v-if="!isIos && phoneNumber.length > 0"
          >
            <ion-icon
              slot="icon-only"
              icon="/Images/tabs/call-pad/backspace_ios.svg"
              color="black"
            />
          </RemoveIcon>
        </div>
      </div>

      <div dir="ltr">
        <NumbersPad v-model:numbers="phoneNumber" />
      </div>

      <div class="call-button" @click="makeACall">
        <img src="/Images/tabs/call-pad/phone.svg" alt="call icon" />
      </div>
    </div>
    <AddContactModal v-if="nestedModalsDesktop.addContact.status" />
  </div>
</template>

<script setup>
import { detectNumberInContactList } from '@/helpers/contactsParser';
import { IonIcon, IonInput, isPlatform } from '@ionic/vue';
import { ref, computed, watch, onMounted, defineEmits } from 'vue';
import RemoveIcon from '@/components/callpad/RemoveCharsButton.vue';
import NumbersPad from '@/components/desktop/callPad/numbersPad.vue';
import { useCallStore } from '@/store/call/call.js';
import AddContactModal from '@/components/desktop/modals/addContact.vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop';

const isIos = computed(() => {
  return isPlatform('ios');
});

const emit = defineEmits(['close']);
const nestedModalsDesktop = useNestedModalsDesktop();
const phoneNumber = ref('');
const callPadPhoneNumberInput = ref();
const addContactState = ref(false);

const inputPhoneNumber = (element) => {
  const value = element.target.value;
  if (/[^0-9#*]/g.test(value)) {
    let filtredNumber = value.replace(/[^0-9#*]/g, '');
    phoneNumber.value = filtredNumber;
    callPadPhoneNumberInput.value.$el.value = filtredNumber;
  }
};

const makeACall = () => {
  if (phoneNumber.value.length < 2) return;
  if (phoneNumber.value) {
    const callStore = useCallStore();
    callStore.makingCallHandler(phoneNumber.value);
    emit('close');
  }
};

const addContact = () => {
  nestedModalsDesktop.callPad = false;
  nestedModalsDesktop.addContact.status = true;
  nestedModalsDesktop.addContact.mode = 'create';
  nestedModalsDesktop.addContact.data.phoneNumber = phoneNumber.value;
};

watch(phoneNumber, (oldValue, newValue) => {
  const result = detectNumberInContactList(phoneNumber.value);
  if (phoneNumber.value.length > 3 && !result) {
    addContactState.value = true;
  } else {
    addContactState.value = false;
  }
});

onMounted(() => {
  callPadPhoneNumberInput.setFocus();
});
</script>

<style scoped>
.remove-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
.add-contact {
  display: flex;
  justify-content: center;
  align-items: center;
}
.add-contact img {
  width: 15px;
  height: 15px;
  cursor: pointer;
}
.callpad-input-container {
  width: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-content {
  width: 250px;
}
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
.pad-on-close {
  position: absolute;
  top: 10vw;
  right: 10vw;
  color: white;
}

.call-button {
  width: 120px;
  height: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #428cff;
  border-radius: 15px;
  padding: 10px 0;
  cursor: pointer;
}

.call-button img {
  width: 30px;
  height: 30px;
}
</style>
