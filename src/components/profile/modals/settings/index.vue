<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons :slot="languageIsEnglish ? 'start' : 'end'">
          <span class="header-title">
            {{ t('tabs.profile.setting.title') }}
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
      <div class="options-part">
        <div class="option-item" @click="openLanguageModal">
          <div class="option-item-logo">
            <ion-icon
              icon="/Images/tabs/profile/setting/language.svg"
            ></ion-icon>
          </div>
          <div class="option-item-title">
            {{ t('tabs.profile.setting.language') }}
          </div>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item" @click="changeCalendar">
          <div class="option-item-logo">
            <ion-icon
              icon="/Images/tabs/profile/setting/calendar.svg"
            ></ion-icon>
          </div>
          <div class="option-item-title">
            <ion-toggle
              justify="space-between"
              class="w-full"
              :checked="isShamsi"
              >{{ t('tabs.profile.setting.calendar') }}</ion-toggle
            >
          </div>
        </div>
        <div class="option-item-border"></div>

        <div class="option-item" @click="changeTheme">
          <div class="option-item-logo">
            <ion-icon :icon="moonOutline" v-show="isDark"></ion-icon>
            <ion-icon :icon="sunnyOutline" v-show="!isDark"></ion-icon>
          </div>

          <div class="option-item-title">
            <ion-toggle
              justify="space-between"
              class="w-full"
              :checked="isDark"
              >{{ t('tabs.profile.setting.theme') }}</ion-toggle
            >
          </div>
        </div>
        <div class="option-item-border"></div>

        <div class="option-item">
          <div class="option-item-logo">
            <!-- <ion-icon icon="/Images/tabs/profile/setting/version.svg"></ion-icon> -->
          </div>

          <div class="option-item-title">
            <div class="option-content">
              <span>
                {{ t('tabs.profile.setting.version') }}
              </span>
              <span>
                {{ version }}
              </span>
            </div>
          </div>
        </div>
        <div class="option-item-border"></div>
      </div>
    </ion-content>
  </IonPage>
  <CalendarModal
    :isOpen="calendarStatus"
    :message="alertText"
    @changeOpenStatus="calendarStatus = false"
  />
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
  IonToggle,
  modalController,
} from '@ionic/vue';
import { arrowForward, moonOutline, sunnyOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import ChangeLanguageModal from '@/components/profile/modals/settings/language.vue';
import CalendarModal from '@/components/profile/modals/settings/calendar.vue';
import { useLocaleStore } from '@/store/locale.js';
import { useThemeStore } from '@/store/theme.js';
import { version } from '@/../package.json';

const { t, locale } = useI18n();

const calendarStatus = ref(false);
const isDark = ref(false);
const isShamsi = ref(false);
const alertText = ref('');

const changeCalendar = () => {
  alertText.value = isShamsi.value
    ? `${t('tabs.profile.setting.tomiladi')}`
    : `${t('tabs.profile.setting.toshamsi')}`;
  isShamsi.value = !isShamsi.value;
  calendarStatus.value = true;
  const localeStore = useLocaleStore();
  localeStore.userSelected = isShamsi.value ? 'fa-IR' : 'en-US';
};

const changeTheme = () => {
  isDark.value = !isDark.value;
  const themeStore = useThemeStore();
  const theme = isDark.value ? 'dark' : 'light';
  themeStore.setUserSelectedThem(theme);
  document.body.classList.toggle('dark', isDark.value);
};
const getCurrenttCalenderFormat = computed(() => {
  const localeStore = useLocaleStore();
  return localeStore.userSelected == 'fa-IR';
});
const getCurrentThemeIsDark = computed(() => {
  const themeStore = useThemeStore();
  return themeStore.getThemeIsDark;
});
const languageIsEnglish = computed(() => locale.value == 'en');

const openLanguageModal = async () => {
  const modal = await modalController.create({
    component: ChangeLanguageModal,
  });
  modal.present();
};

const back = () => {
  modalController.dismiss();
};
onMounted(() => {
  isDark.value = getCurrentThemeIsDark.value;
  isShamsi.value = getCurrenttCalenderFormat.value;
});
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
.en-back {
  order: 1;
  transform: rotate(180deg);
}
.fa-back {
  order: 3;
}
.w-full {
  width: 100%;
}
ion-content ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
}
.font-farsi .options-part {
  direction: rtl;
}
.options-part {
  padding-right: 10px;
}
.option-item {
  display: flex;
  gap: 10px;
  font-size: 20px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.option-item-logo {
  width: 25px;
  height: 25px;
}
.option-item-logo svg {
  fill: #92949c91;
}
.option-item-title {
  width: 100%;
  padding-top: 15px;
  padding-bottom: 10px;
  font-weight: bold;
}
.option-item-border {
  height: 1px;
  width: 100%;
  border-bottom: 1px solid #92949c91;
  position: relative;
}
.option-content {
  display: flex;
  justify-content: space-between;
}
</style>
