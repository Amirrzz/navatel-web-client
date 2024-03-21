<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-refresher :pull-min="300" slot="fixed" @ionRefresh="refreshPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div class="numbers-keypad-container">
        <div class="callpad-input-container">
          <span
            class="add-number-md-icon fade-in-animation"
            v-if="!isIos"
            v-show="showAddNumberToContacts"
            @click="openAddContactModal"
          >
            &#x002B;
          </span>
          <ion-input
            mode="ios"
            autofocus
            inputmode="none"
            v-model="phoneNumber"
            @ionInput="inputPhoneNumber"
            class="english-font"
            maxlength="12"
            ref="callPadPhoneNumberInput"
            dir="ltr"
          ></ion-input>
          <RemoveIcon
            v-model:characters="phoneNumber"
            class="remove-icon md-remove-icon fade-in-animation user-select-none"
            v-if="!isIos && phoneNumber.length > 0"
          >
            <ion-icon
              slot="icon-only"
              icon="/Images/tabs/call-pad/backspace_ios.svg"
            />
          </RemoveIcon>
        </div>
        <ion-text
          class="ion-text-center add-number-to-contacts"
          color="primary"
          @click="openAddContactModal"
          v-if="isIos"
        >
          <span v-show="showAddNumberToContacts">
            {{ t('tabs.callpad.addNumber') }}
          </span>
        </ion-text>
        <NumbersPad v-model:numbers="phoneNumber" />
        <div class="action-buttons">
          <ion-button
            shape="round"
            size="large"
            class="call-button"
            @click="makeACall"
          >
            <ion-icon slot="icon-only" icon="/Images/tabs/call-pad/phone.svg" />
          </ion-button>
          <span class="remove-icon-container">
            <RemoveIcon
              v-model:characters="phoneNumber"
              class="remove-icon ios-remove-icon fade-in-animation"
              v-if="isIos && phoneNumber.length > 0"
            >
              <ion-icon
                slot="icon-only"
                icon="/Images/tabs/call-pad/backspace_ios.svg"
                class="backspace-icon"
              />
            </RemoveIcon>
          </span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonButton,
  IonText,
  IonIcon,
  IonInput,
  isPlatform,
  modalController,
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useContactsStore } from '@/store/contacts/contacts.js';

import RemoveIcon from '@/components/callpad/RemoveCharsButton.vue';
import NumbersPad from '@/components/callpad/NumbersPad.vue';
import AddContactModal from '@/components/contacts/add/index.vue';
import { useCallStore } from '@/store/call/call.js';
import { useRouter } from 'vue-router';
const router = useRouter();
const contactStore = useContactsStore();

const { t } = useI18n();
const isIos = computed(() => {
  return isPlatform('ios');
});
const showAddNumberToContacts = computed(() => {
  // we should check number exist in contants list
  if (phoneNumber.value.length <= 10) {
    // && !checkNumberExist(phoneNUmber)
    return false;
  }
  const userInContacts = contactStore.getUserInAllContacts(phoneNumber.value);
  return userInContacts ? false : true;
});
const phoneNumber = ref('');
const callPadPhoneNumberInput = ref();
const inputPhoneNumber = (element) => {
  const value = element.target.value;
  if (/[^0-9#*]/g.test(value)) {
    let filtredPrice = value.replace(/[^0-9#*]/g, '');
    phoneNumber.value = filtredPrice;
    callPadPhoneNumberInput.value.$el.value = filtredPrice;
  }
};
const refreshPage = () => {
  location.reload();
};
const makeACall = () => {
  if (phoneNumber.value.length < 2) return;
  if (phoneNumber.value) {
    const callStore = useCallStore();
    callStore.makingCallHandler(phoneNumber.value);
  }
};

const openAddContactModal = async () => {
  const modal = await modalController.create({
    component: AddContactModal,
    componentProps: {
      defaultNumber: phoneNumber.value,
    },
  });

  modal.present();

  const { role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    // here should handel end call [process
  }
};
</script>
<style scoped>
.ion-page {
  justify-content: flex-end;
}
ion-input {
  font-size: calc(38px - 2vw);
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
  all: unset;
  position: relative;
  padding: 5px;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.remove-icon {
  all: unset;
}
.add-number-md-icon {
  font-size: 20px;
  padding: 5px;
  border-radius: 50%;
}

.add-number-to-contacts {
  width: 100%;
  font-size: 14px;
  min-height: 22px;
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
.backspace-icon {
  width: 20px;
  height: 20px;
}
.numbers-keypad-container {
  padding-bottom: 2vh;
}
ion-content::part(scroll) {
  scrollbar-width: none;
  /* overflow-y: hidden; */
}
ion-content::part(scroll)::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}
</style>
