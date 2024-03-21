<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="addContact">
            <ion-icon
              v-if="!isLoading"
              :icon="checkmark"
              slot="icon-only"
              size="large"
            >
            </ion-icon>
            <ion-spinner v-else></ion-spinner>
          </ion-button>
        </ion-buttons>
        <ion-title class="toolbar-title">{{
          t('tabs.contacts.addContacts.title')
        }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="modalController.dismiss()">
            <ion-icon :icon="arrowForward" slot="icon-only" size="large">
            </ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :forceOverscroll="false" class="ion-padding">
      <ion-row class="ion-align-items-start height-100">
        <ion-col size="12" size-sm="6" size-md="4" offset-sm="3" offset-md="4">
          <main class="container">
            <div class="name-family-container">
              <div class="circle-gray" v-if="!isAndroid">
                {{ t('tabs.contacts.addContacts.contact') }}
              </div>
              <div class="width-100">
                <ion-input
                  type="text"
                  :label="t('tabs.contacts.addContacts.firstName')"
                  label-placement="stacked"
                  :placeholder="
                    t('tabs.contacts.addContacts.firstNamePlaceholder')
                  "
                  fill="outline"
                  class="border-gray mb-30"
                  :class="{
                    'ion-touched': errors?.firstName,
                    'ion-invalid': errors?.firstName,
                  }"
                  v-bind="firstName"
                  :error-text="errors?.firstName"
                  enterkeyhint="next"
                  @keyup.enter="changeInput('lastNameInput')"
                  @ion-focus="inputFocuCallback"
                  @ionBlur="
                    InputBlurCallback(
                      $event,
                      t('tabs.contacts.addContacts.firstNamePlaceholder'),
                    )
                  "
                  :dir="languageIsEnglish ? 'ltr' : 'rtl'"
                >
                </ion-input>
                <ion-input
                  type="text"
                  :label="t('tabs.contacts.addContacts.lastName')"
                  label-placement="stacked"
                  :placeholder="t('tabs.contacts.addContacts.lastName')"
                  fill="outline"
                  class="border-gray"
                  :class="{
                    'ion-touched': errors?.lastName,
                    'ion-invalid': errors?.lastName,
                  }"
                  v-bind="lastName"
                  :error-text="errors?.lastName"
                  @keyup.enter="changeInput('phoneNumberInput')"
                  enterkeyhint="next"
                  @ion-focus="inputFocuCallback"
                  @ionBlur="
                    InputBlurCallback(
                      $event,
                      t('tabs.contacts.addContacts.lastName'),
                    )
                  "
                  :dir="languageIsEnglish ? 'ltr' : 'rtl'"
                  id="lastNameInput"
                >
                </ion-input>
              </div>
            </div>

            <ion-select
              aria-label="Country"
              :toggle-icon="chevronDownOutline"
              :label="t('auth.phonePage.country')"
              :placeholder="t('auth.phonePage.country')"
              label-placement="floating"
              interface="popover"
              size="cover"
              :showBackdrop="false"
              fill="outline"
              class="mb-30 mt-30 border-gray"
              v-model="perfixCode"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
              :class="{
                'ion-touched': setInValidBorder,
                'ion-invalid': setInValidBorder,
              }"
            >
              <ion-select-option
                v-for="country in countryCodes"
                :value="country"
                :key="country.name"
                class="select-option-country"
              >
                <div>
                  {{ country.name }}
                </div>
              </ion-select-option>
            </ion-select>
            <ion-input
              type="text"
              inputmode="numeric"
              :label="t('auth.phonePage.phoneNumber')"
              label-placement="stacked"
              :placeholder="phoneNumberPlaceHolder"
              fill="outline"
              class="phone-number-input-container border-gray"
              :class="{
                'ion-touched': errors.phoneNumber,
                'ion-invalid': errors.phoneNumber,
              }"
              v-bind="phoneNumber"
              :error-text="errors.phoneNumber"
              enterkeyhint="done"
              :maxlength="getterMaxLength"
              @keyup.enter="addContact"
              @ionInput="validatePhoneNumber"
              @ion-focus="inputFocuCallback"
              @ionBlur="InputBlurCallback"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
              id="phoneNumberInput"
            >
              <div slot="label" class="perfixCode">
                {{ perfixCode?.code ? '+' + perfixCode.code : '' }}
              </div>
            </ion-input>
          </main>
        </ion-col>
      </ion-row>
      <ion-toast
        :is-open="toastIsOpen"
        :message="t('tabs.contacts.addContacts.validationErrors.userIsExist')"
        :duration="3000"
        :dir="languageIsEnglish ? 'ltr' : 'rtl'"
      ></ion-toast>
    </ion-content>
  </IonPage>
</template>
<script setup>
import {
  IonPage,
  IonCol,
  IonButton,
  IonButtons,
  IonSelectOption,
  IonToast,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRow,
  IonInput,
  IonSelect,
  IonIcon,
  isPlatform,
  modalController,
} from '@ionic/vue';
import countries from '@/helpers/countries.json';
import { checkmark, arrowForward } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { useBackButton } from '@ionic/vue';
import { chevronDownOutline } from 'ionicons/icons';
import { ref, computed, defineProps } from 'vue';
import { useForm } from 'vee-validate';
import { object, string } from 'yup';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useAuthStore } from '@/store/auth/auth.js';

const authStore = useAuthStore();

const countryCodes = ref(countries);

const props = defineProps({
  defaultNumber: {
    type: String,
  },
});

const { t, locale } = useI18n();
const contactStore = useContactsStore();
const isLoading = ref(false);
const toastIsOpen = ref(false);
const languageIsEnglish = computed(() => locale.value == 'en');
const isAndroid = computed(() => {
  return isPlatform('android');
});

/// validation config
const { errors, defineInputBinds, handleSubmit } = useForm({
  initialValues: {
    phoneNumber: props.defaultNumber || '',
  },
  validationSchema: object({
    phoneNumber: string()
      .required(t('auth.phonePage.validationErrors.required'))
      .min(10, t('auth.phonePage.validationErrors.min')),
    firstName: string().required(
      t('tabs.contacts.addContacts.validationErrors.firstName'),
    ),
    lastName: string().required(
      t('tabs.contacts.addContacts.validationErrors.lastName'),
    ),
  }),
});

/// define variable of phoneNumber
// its same as phoneNumber = ref("")
// this logic is for validating
const phoneNumber = defineInputBinds('phoneNumber', {
  validateOnInput: false,
});
const getDefaultPrefixFormat = () => {
  if (props.defaultNumber) return;
  return countryCodes.value.find((e) => e.code == authStore.defaultCountryCode);
};
const perfixCode = ref(getDefaultPrefixFormat());
const countryisValid = ref();
const phoneNumberPlaceHolder = computed(() => {
  return perfixCode.value?.format ? perfixCode.value.format : '___ ____ ____';
});
const getterMaxLength = computed(() => {
  return perfixCode.value?.format
    ? perfixCode.value?.format.replaceAll().length -
        perfixCode.value.code.length
    : 12;
});

const firstName = defineInputBinds('firstName', {
  validateOnInput: false,
});
const lastName = defineInputBinds('lastName', {
  validateOnInput: false,
});

const changeInput = (elementId) => {
  const element = document.querySelector(`body #${elementId} input`);
  element.focus();
};
// Handler for validating variables
// handelSubmit get two callbacks function
// first for when form is valid
function validHandeler() {
  return {
    phoneNumber: phoneNumber.value.value,
  };
}
const setInValidBorder = computed(() => {
  if (perfixCode.value) return false;
  if (countryisValid.value == null || countryisValid.value == true)
    return false;
  return true;
});
// second for when from is invalid
function inValidHandler(data) {
  if (perfixCode.value) countryisValid.value = true;
  throw data.errors;
}
// checkFormIsValid calling when validation is needed
const checkFormIsValid = handleSubmit(validHandeler, inValidHandler);

// send phoneNumber to server
function addContact() {
  if (!perfixCode.value) countryisValid.value = false;
  checkFormIsValid()
    .then((data) => {
      // here form is valid
      if (perfixCode.value) countryisValid.value = true;
      if (!countryisValid.value) return;

      let phone = data.phoneNumber;
      const fullNumber = perfixCode.value.code + phone;
      const contactData = {
        fullNumber: fullNumber,
        fullName: firstName.value.value + ' ' + lastName.value.value,
      };
      const existContact = contactStore.getUserInNavaphoneContacts(
        contactData.fullNumber,
      );
      if (!existContact) {
        isLoading.value = true;
        contactStore
          .addContact(contactData)
          .then(() => {
            isLoading.value = false;
            modalController.dismiss(true, 'confirm');
          })
          .catch((e) => {
            // we should handel server error
          });
      } else {
        toastIsOpen.value = true;
        setTimeout(() => {
          toastIsOpen.value = false;
        }, 3000);
        // show message user is exist
      }
    })
    .catch((error) => {
      // here form is unvalid
    });
}
const validatePhoneNumber = (value) => {
  const inputPhoneNumber = value.target.value;
  if (/[^0-9#*]/g.test(inputPhoneNumber)) {
    const filtredNumber = inputPhoneNumber.replace(/[^0-9#*]/g, '');
    value.target.value = filtredNumber;
    phoneNumber.value.value = filtredNumber;
  }
};

const InputBlurCallback = (element, placeholder = '0912345678') => {
  element.target.setAttribute('placeholder', placeholder);
};
const inputFocuCallback = (element) => {
  element.target.setAttribute('placeholder', '');
};
</script>
<style scoped>
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
}
.toolbar-title {
  font-size: 20px;
  text-align: center;
}

ion-content ion-button {
  width: 100%;
  margin-top: 55px;
}
ion-select::part(icon) {
  width: 20px;
  opacity: 1;
}
ion-select.ios,
ion-input.ios {
  height: 70px;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
}

.border-gray.ios {
  border-bottom: 1px solid var(--ion-color-step-300, #b3b3b3);
}
.perfixCode {
  position: absolute;
  top: 35.5px;
  left: 0;
  padding-right: 3.3px;
  border-right: 1px solid var(--ion-color-step-300, #b3b3b3);
  min-width: 45px;
  direction: ltr;
}
.name-family-container {
  width: 100%;
  gap: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row-reverse;
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
</style>
<style>
.phone-number-input-container .input-wrapper input {
  padding-left: 55px;
  direction: ltr;
}
.phone-number-input-container.md .perfixCode {
  top: 18px;
  left: 10px;
}
</style>
