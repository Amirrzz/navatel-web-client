<template>
  <div class="modal-container">
    <div class="modal">
      <coreHeader width="100%" height="85px">
        <template #headerContent>
          <div class="header">
            <div class="icon-container">
              <ion-icon
                :icon="close"
                style="color: #fff; font-size: 30px; cursor: pointer"
                @click="closeModal"
              ></ion-icon>
            </div>
            <div class="header-content">
              <span v-if="mode == 'create'">
                {{ $t('desktop.addContact') }}
              </span>
              <span v-if="mode == 'edit'">
                {{ $t('desktop.editContact') }}
              </span>
            </div>
            <div class="submit-container">
              <ion-icon
                :icon="checkmark"
                style="
                  color: #fff;
                  font-size: 40px;
                  cursor: pointer;
                  font-weight: 700;
                "
                @click="addContact"
              ></ion-icon>
            </div>
          </div>
        </template>
      </coreHeader>

      <div class="options-container" :class="{ 'option-dark': themeIsDark }">
        <div class="contact-info-container">
          <div class="circle-container">
            <div class="circle-gray">
              {{ $t('tabs.contacts.addContacts.contact') }}
            </div>
          </div>
          <div class="info-form-container">
            <input
              v-model="form.fristName"
              class="input"
              :class="{ 'input-error': formError.fristNamError }"
              style="width: 300px"
              type="text"
              placeholder="نام"
            />
            <span v-if="formError.fristNamError" class="text-error-content">{{
              $t('desktop.fristNamError')
            }}</span>
            <input
              v-model="form.lastName"
              class="input"
              :class="{ 'input-error': formError.lastNameError }"
              style="width: 300px"
              type="text"
              placeholder="نام خانوادگی"
            />
            <span v-if="formError.lastNameError" class="text-error-content">{{
              $t('desktop.lastNameError')
            }}</span>
          </div>
        </div>
        <div class="phone-number-container">
          <input
            :disabled="mode == 'edit'"
            v-model="form.countryCode"
            class="input"
            :class="{ 'input-error': formError.countryCodeError }"
            dir="ltr"
            style="width: 50px"
            type="text"
          />
          <div style="width: 1px; height: 27px; background: #b3b3b3"></div>
          <input
            :disabled="mode == 'edit'"
            v-model="form.phoneNumber"
            dir="ltr"
            class="input"
            :class="{ 'input-error': formError.phoneNumberError }"
            style="width: 340px; padding-left: 10px"
            type="text"
          />
        </div>
        <div style="display: flex; flex-direction: column; padding: 0 80px">
          <span v-if="formError.countryCodeError" class="text-error-content">{{
            $t('desktop.countryCodeError')
          }}</span>
          <span v-if="formError.phoneNumberError" class="text-error-content">{{
            $t('desktop.phoneNumberError')
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { close, checkmark } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { useThemeStore } from '@/store/theme.js';
import { computed, ref, onMounted } from 'vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useContactsStore } from '@/store/contacts/contacts.js';

import coreHeader from '../coreHeader.vue';

const contactStore = useContactsStore();
const form = ref({
  fristName: '',
  lastName: '',
  phoneNumber: '',
  countryCode: '+98',
});

const formError = ref({
  fristNamError: false,
  lastNameError: false,
  phoneNumberError: false,
  countryCodeError: false,
});

const props = defineProps({
  formValueInEdit: {
    type: Object,
    default: {},
  },
});

const selectedContact = computed(() => {
  return contactStore.selectedConatct;
});

const mode = computed(() => {
  return nestedModalsDesktop.addContact.mode;
});

const nestedModalsDesktop = useNestedModalsDesktop();
const themeStore = useThemeStore();

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const closeModal = () => {
  nestedModalsDesktop.addContact.data.phoneNumber = '';
  nestedModalsDesktop.changeStatusAddContact(false);
};

const addContact = () => {
  if (form.value.fristName.length == 0) {
    formError.value.fristNamError = true;
  } else {
    formError.value.fristNamError = false;
  }
  if (form.value.lastName.length == 0) {
    formError.value.lastNameError = true;
  } else {
    formError.value.lastNameError = false;
  }
  if (form.value.phoneNumber.length == 0) {
    formError.value.phoneNumberError = true;
  } else {
    formError.value.phoneNumberError = false;
  }
  if (form.value.countryCode.length == 0) {
    formError.value.countryCodeError = true;
  } else {
    formError.value.countryCodeError = false;
  }
  if (
    !formError.value.fristNamError &&
    !formError.value.lastNameError &&
    !formError.value.phoneNumberError &&
    !formError.value.countryCodeError
  ) {
    const result = {
      fullNumber: form.value.countryCode.slice(1) + form.value.phoneNumber,
      fullName: form.value.fristName + ' ' + form.value.lastName,
    };
    if (mode.value == 'create') {
      contactStore.addContact(result).then((res) => {
        contactStore.getContactsList();
        nestedModalsDesktop.changeStatusAddContact(false);
      });
    } else {
      contactStore.editContact(result).then((res) => {
        contactStore.getContactsList();
        nestedModalsDesktop.changeStatusAddContact(false);
      });
    }
  }
};

onMounted(() => {
  if (mode.value == 'edit') {
    if (selectedContact.value) {
      const contactFullName = selectedContact.value.name.split(' ');
      form.value.phoneNumber = selectedContact.value.contact_phone.slice(2);
      form.value.fristName = contactFullName[0];
      form.value.lastName = contactFullName[1];
    }
  } else {
    if (nestedModalsDesktop.addContact.data.phoneNumber) {
      form.value.phoneNumber = nestedModalsDesktop.addContact.data.phoneNumber;
    }
  }
});
</script>

<style scoped>
.contact-info-container {
  width: 100%;
  display: flex;
  padding: 30px 30px;
}
.circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.circle-gray {
  width: 15vw;
  height: 15vw;
  min-width: 80px;
  min-height: 80px;
  max-width: 120px;
  max-height: 120px;
  background-color: #6d6d6db4;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.info-form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  justify-content: center;
}

.phone-number-container {
  direction: ltr;
  width: 100%;
  display: flex;
  padding: 0 45px;
  align-items: center;
}

.input {
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  border-bottom: 1px solid #b3b3b3;
  padding: 10px 0;
  margin-bottom: 5px;
}

.input-error {
  border-bottom: 1px solid #f00;
  color: #f00;
}

.text-error-content {
  color: #f00;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
@keyframes bg-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-animation {
  0% {
    margin-top: 800px;
  }
  100% {
    margin-top: 0;
  }
}
.modal-container {
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00000095;
  animation: 0.3 bg-animation;
}

.modal {
  border-radius: 10px;
  overflow: hidden;
  width: 550px;
  background: #fff;
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  animation: 0.4s modal-animation;
}

.header {
  height: 85px;
  display: flex;
  padding: 0 15px;
}

.icon-container {
  padding-top: 10px;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content span {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.submit-container {
  width: 12%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-file-container {
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.upload-file-container img {
  width: 26px;
}

.info {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.info .name {
  font-size: 19px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.info .status {
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.information .title {
  color: #06f;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.information .subtext {
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: #bebebe;
}

.information .text {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-top: 15px;
}

.options-container {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  padding: 0px 15px;
  padding-bottom: 15px;
  color: #101010;
}

.option-dark {
  color: #fff;
}
</style>
