<template>
  <ion-page>
    <ion-content :forceOverscroll="false" class="ion-padding">
      <ion-row class="ion-align-items-center height-100">
        <ion-col size="12" size-sm="6" size-md="4" offset-sm="3" offset-md="4">
          <main class="container-full">
            <div class="logo" :class="{ 'scale-down-logo': isOpen }">
              <img src="/Images/Navatel-Logo.png" alt="Navatel-Logo" />
            </div>
            <h1 class="mb-20">{{ t('auth.confirmPage.title') }}</h1>
            <div class="mb-20 prefix-phone-container">
              <span>+{{ authStore.prefix }}</span>
              <span class="ion-margin-start">{{ authStore.phoneNumber }}</span>
              <ion-icon
                :icon="pencilOutline"
                @click="router.push('/auth/phone')"
              ></ion-icon>
            </div>
            <ion-input
              aria-label="Confrim Code"
              :label="t('auth.confirmPage.confirmCode')"
              color="primary"
              placeholder="240872"
              label-placement="stacked"
              type="text"
              inputmode="numeric"
              :fill="isAndroid ? 'outline' : null"
              class="mb-20 confrim-input"
              :class="{
                'ion-invalid': errors?.confirmCode || inValidCodeMessage,
              }"
              mode="md"
              maxlength="6"
              enterkeyhint="done"
              @keyup.enter="login"
              v-bind="confirmCode"
              :error-text="errors?.confirmCode || inValidCodeMessage"
              @ion-focus="inputFocuCallback"
              @ionBlur="InputBlurCallback"
              ref="confrimInputHtml"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
            ></ion-input>
            <ion-text color="dark">
              <h1>{{ calcalutorTimer.min }}:{{ calcalutorTimer.sec }}</h1>
            </ion-text>
            <ion-text
              :color="!activeSendAgainCode ? 'medium' : 'primary'"
              class="ion-text-center"
              @click="resendCode"
            >
              {{ t('auth.confirmPage.resendHint') }}
            </ion-text>
            <ion-button expand="block" :disabled="disabled" @click="login">
              <span v-if="!isLoading">{{ t('auth.confirmPage.button') }}</span>
              <ion-spinner v-else></ion-spinner
            ></ion-button>
          </main>
        </ion-col>
      </ion-row>
      <ion-toast
        :is-open="toastIsOpen"
        :message="
          t('auth.confirmPage.resendMessage', {
            phoneNumber: authStore.phoneNumber,
          })
        "
        :duration="3000"
        :buttons="toastButtons"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonRow,
  IonButton,
  IonCol,
  IonIcon,
  IonInput,
  IonText,
  isPlatform,
  IonToast,
  IonSpinner,
  useKeyboard,
  onIonViewDidEnter,
  onIonViewWillLeave,
} from '@ionic/vue';
import { pencilOutline } from 'ionicons/icons';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { object, string } from 'yup';
import { useAuthStore } from '@/store/auth/auth.js';
import { useUserStore } from '@/store/user/user.js';
import { useI18n } from 'vue-i18n';
import unregisterServiceWoker from '@/helpers/unregisterServiceWoker.js';

const { t, locale } = useI18n();
const { isOpen } = useKeyboard();
const authStore = useAuthStore();
const router = useRouter();
const isLoading = ref(false);
const languageIsEnglish = computed(() => locale.value == 'en');
const inValidCodeMessage = ref();
/// popups logic
const toastIsOpen = ref(false);
const disabled = ref(false);
const toastButtons = [
  {
    text: t('auth.confirmPage.dismiss'),
    role: 'cancel',
    handler: () => {
      toastIsOpen.value = false;
    },
  },
];

const isAndroid = computed(() => {
  return isPlatform('android');
});

const { errors, defineInputBinds, handleSubmit, resetForm } = useForm({
  initialValues: {
    confirmCode: '',
  },
  validationSchema: object({
    confirmCode: string()
      .required(t('auth.confirmPage.validationErrors.required'))
      .length(6, t('auth.confirmPage.validationErrors.min')),
  }),
});
const confirmCode = defineInputBinds('confirmCode', {
  validateOnInput: false,
});
// Handler for validating variables
// handelSubmit get two callbacks function
// first for when form is valid
function validHandeler() {
  inValidCodeMessage.value = null;
  return {
    confirmCode: confirmCode.value.value,
  };
}
// second for when from is invalid
function inValidHandler(data) {
  inValidCodeMessage.value = null;
  throw data.errors;
}
// checkFormIsValid calling when validation is needed
const checkFormIsValid = handleSubmit(validHandeler, inValidHandler);

function login() {
  const userStore = useUserStore();
  confrimInputHtml.value.$el.classList.add('ion-touched');
  checkFormIsValid().then((data) => {
    disabled.value = true;
    isLoading.value = true;
    // here form is valid
    let confirmCode = data.confirmCode;
    authStore
      .login(confirmCode)
      .then(() => {
        isLoading.value = false;
        disabled.value = false;
        // here we pushed to next step of login
        if (userStore.nickname) {
          requestAnimationFrame(() => {
            const osWidth = window.screen.width;
            if (osWidth > 600) {
              router.push('/desktop/message');
              setTimeout(() => {
                location.reload();
              }, 100);
            } else {
              router.push('/callpad');
            }
          });
        } else {
          requestAnimationFrame(() => {
            router.push('/auth/info');
          });
        }
      })
      .catch((e) => {
        if (e.toString().includes('Dosent match')) {
          inValidCodeMessage.value = t('auth.confirmPage.invalidCode');
        }
        isLoading.value = false;
        disabled.value = false;
      });
  });
}

watch(confirmCode, () => {
  if (confirmCode.value.value.length === 6) {
    requestAnimationFrame(() => {
      login();
    });
  }
});

function resendCode() {
  if (!activeSendAgainCode.value) return;
  isLoading.value = true;
  toastIsOpen.value = true;
  authStore.resendConfirmCode().then(() => {
    isLoading.value = false;
    timer.value = 120;
    activeSendAgainCode.value = false;
    timerIsOn = true;
    startCounter();
  });
}

const confrimInputHtml = ref();

watch(confirmCode, (code) => {
  if (!code.value) return;
  const filtredNumber = code.value.replace(/[^0-9#*]/g, '');
  confirmCode.value.value = filtredNumber;
  confrimInputHtml.value.$el.value = filtredNumber;
});

const InputBlurCallback = (element) => {
  element.target.setAttribute('placeholder', '240872');
  checkFormIsValid();
};

const inputFocuCallback = (element) => {
  confrimInputHtml.value.$el.classList.remove('ion-touched');
  element.target.setAttribute('placeholder', '');
};

let timerInterval = null;
let timerIsOn = false;
const timer = ref(120);
const activeSendAgainCode = ref(false);

function startCounter() {
  timerInterval = setInterval(() => {
    if (!timerIsOn || timer.value <= 0) {
      activeSendAgainCode.value = true;
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    timer.value--;
  }, 1000);
}

const calcalutorTimer = computed(() => {
  const min = Math.max(Math.floor(timer.value / 60), 0).toString();
  let sec = Math.min(
    Math.floor(timer.value - min * 60),
    timer.value,
  ).toString();
  return {
    min: min.length == 1 ? '0' + min : min,
    sec: sec.length == 1 ? '0' + sec : sec,
  };
});

onIonViewDidEnter(() => {
  resetForm();
  timerIsOn = true;
  timer.value = 120;
  startCounter();
  // we should focuse element in settime out becuse rendering it not done yet
});

onIonViewWillLeave(() => {
  resetForm();
  timerIsOn = false;
  timer.value = 0;
  inValidCodeMessage.value = null;
  if (timerInterval) clearInterval(timerInterval);
});
onMounted(() => {
  unregisterServiceWoker();
});
</script>

<style scoped>
ion-input {
  height: 70px;
}

.input-highlight {
  height: 80px;
}
ion-button {
  width: 100%;
  margin-top: 55px;
}
.logo {
  width: 30vw;
  max-width: 180px;
  min-width: 150px;
  margin-bottom: 40px;
  height: 145px;
  transition: 0.5s;
  transform: scale(1);
}
.scale-down-logo {
  transform: scale(0.7);
}
.prefix-phone-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
ion-icon {
  padding: 5px;
  padding-top: 0;
  margin-left: 10px;
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
<style>
.confrim-input .input-highlight {
  transform: scale(1) !important;
}
.confrim-input input {
  direction: ltr;
}
</style>
