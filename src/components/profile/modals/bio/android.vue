<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="updateBio">
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
            {{ t('tabs.profile.bioModal.title') }}
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
              :placeholder="t('tabs.profile.bioModal.title')"
              class="border-gray mb-30 bio-input"
              :class="[
                locale,
                {
                  'text-align-right': bioTextAlignIsRight?.isRightToLeft,
                  'text-align-left':
                    bioTextAlignIsRight?.isRightToLeft == false,
                },
              ]"
              v-model="bio"
              enterkeyhint="done"
              @keyup.enter="updateBio"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
              :counter="true"
              maxlength="300"
              :counter-formatter="customFormatter"
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
  IonIcon,
  modalController,
} from '@ionic/vue';
import { checkmark, arrowForward } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { detectTextDirection } from '@/helpers/textFormatter.js';
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user/user.js';

const userStore = useUserStore();
const { t, locale } = useI18n();
const bio = ref(userStore.bio);
const isLoading = ref(false);
const languageIsEnglish = computed(() => locale.value == 'en');

const customFormatter = (inputLength, maxLength) => {
  return t('tabs.profile.bioModal.inputHint', {
    count: maxLength - inputLength,
  });
};
const getTextDirection = computed(() => {
  if (
    bioTextAlignIsRight.value &&
    bioTextAlignIsRight.value.detectedChar ==
      bio.value[bioTextAlignIsRight.value.detectedIndexChar]
  )
    return getTextDirection.value;
  return detectTextDirection(bio.value);
});
const bioTextAlignIsRight = ref(getTextDirection);

const updateBio = () => {
  isLoading.value = true;
  userStore
    .setUserStatus({
      uuid: userStore.userId,
      presence: bio.value,
      status: userStore.status,
    })
    .then(() => {
      userStore.getCurrentUserStatus().then(() => {
        isLoading.value = false;
        modalController.dismiss();
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
.bio-input .counter {
  white-space: pre-wrap !important;
  padding-inline-start: 0px !important;
}
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
