<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-row class="ion-align-items-center height-100">
        <ion-col size="12" size-sm="6" size-md="4" offset-sm="3" offset-md="4">
          <main class="container-full">
            <div class="logo">
              <img src="/Images/Navatel-Logo.png" alt="Navatel-Logo" />
            </div>
            <ion-text class="mb-30" color="dark">
              <span class="title">{{ t('auth.startPage.title') }}</span>
            </ion-text>
            <ion-text class="mb-30 sub-title" color="dark">
              <div>{{ t('auth.startPage.subtitle1') }}</div>
              <div>{{ t('auth.startPage.subtitle2') }}</div>
            </ion-text>
            <ion-button
              class="start-button"
              router-link="/auth/phone"
              router-direction="forward"
              >{{ t('auth.startPage.button') }}</ion-button
            >
            <ion-text
              style="cursor: pointer"
              color="primary"
              @click="changeLanguage"
            >
              {{ t('changeLanguage') }}
            </ion-text>
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
  IonRow,
  IonCol,
  IonButton,
  IonText,
} from '@ionic/vue';
import { useAuthStore } from '@/store/auth/auth.js';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '@/store/locale.js';
import unregisterServiceWoker from '@/helpers/unregisterServiceWoker.js';
const { t, locale } = useI18n();
const authStore = useAuthStore();

const changeLanguage = () => {
  if (locale.value == 'en') {
    locale.value = 'fa';
  } else {
    locale.value = 'en';
  }
  authStore.selectedLanguage = locale.value;
  const localeStore = useLocaleStore();
  localeStore.locale = locale.value;
};

onMounted(() => {
  unregisterServiceWoker();
  authStore.getIpData();
});
</script>

<style scoped>
.title {
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.sub-title {
  text-align: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
ion-col {
  color: #fff;
  text-align: center;
}
.logo {
  width: 30vw;
  max-width: 180px;
  min-width: 150px;
  margin-bottom: 20px;
  height: 145px;
}
.start-button {
  --background: var(--ion-color-primary, #428cff);
  --padding-top: 10px;
  --padding-bottom: 10px;
  --padding-start: 85px;
  --padding-end: 85px;
  font-size: 16px;
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
