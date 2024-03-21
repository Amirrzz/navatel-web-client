<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="updateUserName">
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
        <ion-buttons slot="end">
          <span class="header-title">
            {{ t('tabs.profile.usernameModal.title') }}
          </span>
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
            <ion-input
              type="text"
              :placeholder="t('tabs.profile.usernameModal.inputPlaceholder')"
              class="border-gray mb-30 bio-input"
              :class="[
                locale,
                {
                  'text-align-right': userNameAlignIsRight?.isRightToLeft,
                  'text-align-left':
                    userNameAlignIsRight?.isRightToLeft == false,
                  'ion-touched': errors.username,
                  'ion-invalid': errors.username,
                },
              ]"
              :error-text="errors.username"
              v-bind="username"
              enterkeyhint="done"
              @keyup.enter="updateUserName"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
            >
            </ion-input>
          </main>
        </ion-col>
      </ion-row>
    </ion-content>
  </IonPage>
</template>
<script setup>
import {
  IonPage,
  IonCol,
  IonButton,
  IonButtons,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonContent,
  IonRow,
  IonInput,
  IonSelect,
  IonIcon,
  isPlatform,
  modalController,
} from '@ionic/vue';
import { checkmark, arrowForward } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { detectTextDirection } from '@/helpers/textFormatter.js';
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user/user.js';
import { useForm } from 'vee-validate';
import { object, string } from 'yup';
const userStore = useUserStore();
const { t, locale } = useI18n();

const { errors, defineInputBinds, handleSubmit } = useForm({
  initialValues: {
    username: userStore.nickname || '',
  },
  validationSchema: object({
    username: string().required(t('tabs.profile.usernameModal.NameRequired')),
  }),
});
const username = defineInputBinds('username', {
  validateOnInput: true,
});

const isLoading = ref(false);
const languageIsEnglish = computed(() => locale.value == 'en');
const inputValue = username.value.value;
const getTextDirection = computed(() => {
  if (
    userNameAlignIsRight.value &&
    userNameAlignIsRight.value.detectedChar ==
      inputValue[userNameAlignIsRight.value.detectedIndexChar]
  )
    return getTextDirection.value;
  return detectTextDirection(inputValue);
});
const userNameAlignIsRight = ref(getTextDirection);
function validHandeler() {
  return true;
}
// second for when from is invalid
function inValidHandler(data) {
  throw data.errors;
}
// checkFormIsValid calling when validation is needed
const checkFormIsValid = handleSubmit(validHandeler, inValidHandler);

const updateUserName = () => {
  checkFormIsValid().then(() => {
    isLoading.value = true;
    userStore
      .setUserProfile({
        avatar: userStore.avatarFileId,
        nickname: username.value.value,
        phone_number: userStore.phoneNumber,
        username: userStore.userId,
      })
      .then(() => {
        userStore.getCurrentUserProfile().then(() => {
          isLoading.value = false;
          modalController.dismiss();
        });
      });
  });
};
</script>
<style scoped>
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
}
.header-title {
  font-size: 20px;
  text-align: center;
}
.text-align-right {
  text-align: right;
  direction: rtl;
}
.text-align-left {
  text-align: left;
}
</style>
<style>
.en .input-bottom {
  text-align: left;
}
.fa .input-bottom {
  text-align: right;
}
.text-align-left input {
  direction: ltr !important;
}
.text-align-right input {
  direction: rtl !important;
}
</style>
