<template>
  <div class="modal-container">
    <div class="modal">
      <coreHeader width="100%" height="85px">
        <template #headerContent>
          <div class="header">
            <div class="header-content">
              <span>
                {{ $t('desktop.callpad') }}
              </span>
            </div>
            <div class="cloe-content">
              <ion-icon
                :icon="close"
                style="color: #fff; font-size: 30px; cursor: pointer"
                @click="closeModal"
              ></ion-icon>
            </div>
          </div>
        </template>
      </coreHeader>

      <div class="callpad-content" :class="{ 'option-dark': themeIsDark }">
        <CallPadContent @close="closeModal" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { close } from 'ionicons/icons';
import { IonIcon } from '@ionic/vue';
import { useThemeStore } from '@/store/theme.js';
import { computed, ref, onMounted } from 'vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useContactsStore } from '@/store/contacts/contacts.js';

import coreHeader from '../coreHeader.vue';
import CallPadContent from '@/components/desktop/callPad/callPadContent.vue';

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
  nestedModalsDesktop.callPad = false;
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
  }
});
</script>

<style scoped>
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
  width: 400px;
  background: #fff;
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  animation: 0.4s modal-animation;
}

@keyframes modal-animation {
  0% {
    margin-top: 800px;
  }
  100% {
    margin-top: 0;
  }
}

.header {
  width: 100%;
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
  padding-right: 25px;
}

.cloe-content {
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.callpad-content {
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px 15px;
  padding-bottom: 15px;
  color: #101010;
}

.option-dark {
  color: #fff;
}
</style>
