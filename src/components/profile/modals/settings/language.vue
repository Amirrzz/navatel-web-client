<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons :slot="languageIsEnglish ? 'start' : 'end'">
          <span class="header-title">
            {{ t('tabs.profile.setting.applicationlanguage') }}
          </span>
          <ion-button
            :class="languageIsEnglish ? 'en-back' : 'fa-back'"
            @click="back"
          >
            <ion-icon :icon="arrowForward" slot="icon-only" size="large">
            </ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :forceOverscroll="false" class="ion-padding">
      <div class="page-title">
        <span>
          {{ $t('tabs.profile.setting.language') }}
        </span>
      </div>
      <div class="lang-list">
        <ion-radio-group class="" :value="locale">
          <ion-radio
            class="lang-title yekan"
            value="fa"
            @click="changeLanguage('fa')"
          >
            {{ t('tabs.profile.setting.persian') }}</ion-radio
          >
          <br />
          <div class="option-item-border"></div>
          <ion-radio
            class="lang-title"
            value="en"
            @click="changeLanguage('en')"
            >{{ t('tabs.profile.setting.english') }}</ion-radio
          >
          <br />
          <div class="option-item-border"></div>
        </ion-radio-group>
      </div>
    </ion-content>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  modalController,
} from '@ionic/vue';
import { arrowForward } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useLocaleStore } from '@/store/locale.js';
import { useAuthStore } from '@/store/auth/auth.js';
import ChangeLanguageModal from '@/components/profile/modals/settings/language.vue';
import { configurationModalTheme } from '@/theme/modal-default-amimation.js';

const { t, locale } = useI18n();
const authStore = useAuthStore();

const changeLanguage = (lang) => {
  if (locale.value !== lang) {
    locale.value = lang;
    authStore.selectedLanguage = locale.value;
    const localeStore = useLocaleStore();
    localeStore.locale = locale.value;
    configurationModalTheme(locale.value);
  }
};

const languageIsEnglish = computed(() => locale.value == 'en');

const back = () => {
  modalController.dismiss();
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
  order: 2;
}
.font-farsi .page-title,
.font-farsi .lang-list {
  direction: rtl;
}
.page-title {
  color: #06f;
  font-family: Yekan Bakh FaNum;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.lang-list {
  padding-right: 10px;
}
.lang-title {
  padding-top: 15px;
  padding-bottom: 10px;
  font-weight: bold;
  font-size: 20px;
  width: 100%;
}
.en-back {
  order: 1;
  transform: rotate(180deg);
}
.fa-back {
  order: 3;
}
.yekan {
  font-family: Yekan Bakh FaNum;
}
</style>
