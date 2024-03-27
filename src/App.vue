<template>
  <ion-app :class="[languageIsEnglish ? 'font-english' : 'font-farsi']">
    <ion-router-outlet></ion-router-outlet>
    <ErrorMessage />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet, getPlatforms } from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ErrorMessage from './components/ErrorMessage.vue';
import { useThemeStore } from '@/store/theme.js';
const { locale } = useI18n();

const languageIsEnglish = computed(() => locale.value == 'en');
const initialProjectTheme = () => {
  const themeStore = useThemeStore();
  themeStore.setAutoDetectedTheme();
  const themeIsDark = themeStore.getThemeIsDark;
  document.body.classList.toggle('dark', themeIsDark);
};
const initialChatCardCssVariables = () => {
  const platforms = getPlatforms();
  const themeStore = useThemeStore();
  themeStore.setCssVariableSize(platforms);
};

onMounted(() => {
  initialProjectTheme();
  initialChatCardCssVariables();
});
</script>
