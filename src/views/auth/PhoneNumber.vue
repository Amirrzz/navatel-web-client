<template>
  <ion-page>
    <ion-content :forceOverscroll="false" class="ion-padding">
      <ion-row class="ion-align-items-center height-100">
        <ion-col size="12" size-sm="6" size-md="4" offset-sm="3" offset-md="4">
          <main class="container">
            <div class="logo" :class="{ 'scale-down-logo': isOpen }">
              <img src="/Images/Navatel-Logo.png" alt="Navatel-Logo" />
            </div>

            <span class="title mt-30">{{ t('auth.phonePage.title') }}</span>
            <ion-note class="mb-30">{{ version }}</ion-note>
            <ion-text color="dark" class="mb-30 ion-text-center sub-title">
              {{ t('auth.phonePage.subtitle') }}
            </ion-text>
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
              class="mb-30 border-gray"
              v-model="perfixCode"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
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
              :minlength="getterMaxLength"
              :maxlength="getterMaxLength"
              @keyup.enter="sendPhoneNumber"
              @ionInput="validatePhoneNumber"
              @ion-focus="inputFocuCallback"
              @ionBlur="InputBlurCallback"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
            >
              <div slot="label" class="perfixCode">
                {{ perfixCode.code ? '+' + perfixCode.code : '' }}
              </div>
            </ion-input>
            <ion-button
              :disabled="disabled"
              expand="block"
              @click="sendPhoneNumber"
            >
              <span v-if="!isLoading">{{ t('auth.phonePage.button') }}</span>
              <ion-spinner v-else></ion-spinner>
            </ion-button>
          </main>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonInput,
  IonRow,
  IonCol,
  IonNote,
  IonText,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  useKeyboard,
} from '@ionic/vue';

import countries from '@/helpers/countries.json';
import { chevronDownOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { useForm } from 'vee-validate';
import { object, string } from 'yup';
import { useAuthStore } from '@/store/auth/auth.js';
import { version } from '@/../package.json';
import { useI18n } from 'vue-i18n';
import unregisterServiceWoker from '@/helpers/unregisterServiceWoker.js';

const { t, locale } = useI18n();
const { isOpen } = useKeyboard();
const authStore = useAuthStore();
const router = useRouter();
const isLoading = ref(false);
const disabled = ref(false);
const countryCodes = ref(countries);

const languageIsEnglish = computed(() => locale.value == 'en');
const getterMaxLength = computed(() => {
  return perfixCode.value.format
    ? perfixCode.value.format.replaceAll().length - perfixCode.value.code.length
    : 12;
});
/// validation config
const { errors, defineInputBinds, handleSubmit } = useForm({
  validationSchema: object({
    phoneNumber: string().required(
      t('auth.phonePage.validationErrors.required'),
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
  return countryCodes.value.find((e) => e.code == authStore.defaultCountryCode);
};
const perfixCode = ref(getDefaultPrefixFormat());
const phoneNumberPlaceHolder = computed(() => {
  return perfixCode.value.format ? perfixCode.value.format : '___ ____ ____';
});

// Handler for validating variables
// handelSubmit get two callbacks function
// first for when form is valid
function validHandeler() {
  return {
    phoneNumber: phoneNumber.value.value,
  };
}
// second for when from is invalid
function inValidHandler(data) {
  throw data.errors;
}
// checkFormIsValid calling when validation is needed
const checkFormIsValid = handleSubmit(validHandeler, inValidHandler);

// send phoneNumber to server
function sendPhoneNumber() {
  checkFormIsValid()
    .then((data) => {
      // here form is valid
      isLoading.value = true;
      disabled.value = true;
      let phone = data.phoneNumber;
      authStore.prefix = perfixCode.value.code;
      authStore.phoneNumber = phone;
      const fullNumber = perfixCode.value.code + phone;
      authStore.register(fullNumber).then(() => {
        isLoading.value = false;
        disabled.value = false;
        // here we pushed to next step of login
        router.push('/auth/login');
      });
    })
    .catch((error) => {
      // here form is unvalid
    });
}

const validatePhoneNumber = (value) => {
  const inputPhoneNumber = value.target.value;

  if (/[^0-9]/g.test(inputPhoneNumber)) {
    const filtredNumber = inputPhoneNumber.replace(/[^0-9]/g, '');
    value.target.value = filtredNumber;
    phoneNumber.value.value = filtredNumber;
  }
};
const InputBlurCallback = (element) => {
  element.target.setAttribute('placeholder', phoneNumberPlaceHolder.value);
  checkFormIsValid();
};
const inputFocuCallback = (element) => {
  element.target.setAttribute('placeholder', '');
};
onMounted(() => {
  unregisterServiceWoker();
});
</script>

<style scoped>
ion-button {
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
  align-items: center;
}

.border-gray.ios {
  border-bottom: 1px solid var(--ion-color-step-300, #b3b3b3);
}
.logo {
  width: 30vw;
  max-width: 180px;
  min-width: 150px;
  height: 145px;
  transition: 0.5s;
  transform: scale(1);
}
.scale-down-logo {
  transform: scale(0.7);
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
</style>
<style scoped>
.title {
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.sub-title {
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.phone-number-input-container .input-wrapper input {
  padding-left: 55px;
  direction: ltr;
}
.phone-number-input-container.md .perfixCode {
  top: 18px;
  left: 10px;
}
ion-content::part(scroll) {
  scrollbar-width: none;
  overflow-y: hidden;
}
ion-content::part(scroll)::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}
</style>
