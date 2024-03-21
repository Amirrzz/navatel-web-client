import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueEasyLightbox from 'vue-easy-lightbox';

import { IonicVue } from '@ionic/vue';
import i18n from '@/plugins/i18n';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { configurationModalTheme } from '@/theme/modal-default-amimation.js';
// import VueEasyLightbox from 'vue-easy-lightbox/external-css'
// // or
// import VueEasyLightbox from 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.esm.min.js'

// you need to import css file
import 'vue-easy-lightbox/external-css/vue-easy-lightbox.css';
// or
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import 'vue3-emoji-picker/css';

/* Theme variables */
import './theme/variables.css';

/* emoji picker */
import 'vue3-emoji-picker/css';

// 3rd packages csses
import {
  RecycleScroller,
  DynamicScroller,
  DynamicScrollerItem,
} from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

window.baseUrl = import.meta.env.VITE_APP_ROUTER_BASE_URL;

const pinia = createPinia();
// https://prazdevs.github.io/pinia-plugin-persistedstate/guide/
// auto handeling store data in localStorage
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
  .use(IonicVue, {
    innerHTMLTemplatesEnabled: true,
  })
  .use(router);
app.use(VueEasyLightbox).use(pinia).use(i18n);
defineCustomElements(window);
app.component('RecycleScroller', RecycleScroller);
app.component('DynamicScroller', DynamicScroller);
app.component('DynamicScrollerItem', DynamicScrollerItem);
app.config.performance = true;

// Global Error Catched
app.config.errorHandler = (err) => {
  console.log(err, 'In Global');
};
// Custom warning handler (only runs in development)
app.config.warnHandler = (warn) => {
  console.warn(`[CUSTOM WARNING] ${warn}`);
};

router.isReady().then(() => {
  app.mount('#app');
  defineCustomElements(window);
});

configurationModalTheme(i18n.global.locale.value);

setApplicationLanguage();
function setApplicationLanguage() {
  const langObject = JSON.parse(localStorage.getItem('AuthStore')!);
  if (langObject && langObject.selectedLanguage) {
    i18n.global.locale.value = langObject.selectedLanguage || 'en';
    configurationModalTheme(i18n.global.locale.value);
  }
}
