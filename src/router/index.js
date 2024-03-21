import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import { detectOsForNavigate } from '@/helpers/parser.js';

import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuthStore } from '@/store/auth/auth.js';

///Index page
import HomePage from '../views/HomePage.vue';

///Auth Pages
import StartLogin from '../views/auth/StartLogin.vue';
import PhoneNumberLogin from '../views/auth/PhoneNumber.vue';
import ConfirmLogin from '../views/auth/ConfirmLogin.vue';
import UserInformation from '../views/auth/UserInformation.vue';

///Desktop
import LayoutDesktop from '@/views/desktop/index.vue';
import MessageDesktop from '@/views/desktop/message/index.vue';
import ContactsDesktop from '@/views/desktop/contacts/index.vue';
import HistoryDesktop from '@/views/desktop/history/index.vue';

///Tabs
import CallPad from '@/views/tabs/callpad/index.vue';
import Contacts from '@/views/tabs/contacts/index.vue';
import History from '@/views/tabs/history/index.vue';
import Profile from '@/views/tabs/profile/index.vue';
import Message from '@/views/tabs/message/index.vue';

///Iframe
import IframeMessage from '@/components/message/list/index.vue';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

const routes = [
  {
    path: '/desktop',
    name: 'Desktop',
    redirect: detectOsForNavigate(),
    component: LayoutDesktop,
    children: [
      {
        path: '/desktop/message',
        name: 'DesktopMessage',
        component: MessageDesktop,
      },
      {
        path: '/desktop/contacts',
        name: 'DesktopContacts',
        component: ContactsDesktop,
      },
      {
        path: '/desktop/callhistory',
        name: 'DesktopHistory',
        component: HistoryDesktop,
      },
    ],
  },
  {
    path: '/auth/start',
    name: 'StartLogin',
    component: StartLogin,
    meta: {
      noNeedAuth: true,
    },
  },
  {
    path: '/auth/phone',
    name: 'PhoneLogin',
    component: PhoneNumberLogin,
    meta: {
      noNeedAuth: true,
    },
  },
  {
    path: '/auth/login',
    name: 'ConfirmLogin',
    component: ConfirmLogin,
    meta: {
      noNeedAuth: true,
    },
  },
  {
    path: '/auth/info',
    name: 'UserInformation',
    component: UserInformation,
  },
  {
    path: '/iframe/message',
    name: 'IframeMessage',
    component: IframeMessage,
    meta: {
      noNeedAuth: true,
    },
  },

  {
    path: '/',
    name: 'Home',
    redirect: detectOsForNavigate(),
    component: HomePage,
    children: [
      {
        path: '/callpad',
        component: CallPad,
      },
      {
        path: '/contacts',
        component: Contacts,
      },
      {
        path: '/history',
        component: History,
      },
      {
        path: '/profile',
        component: Profile,
      },
      {
        path: '/message',
        component: Message,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  //uncomment for handeling authorization
  if (!to.meta.noNeedAuth && !authStore.isLoggedIn) return '/auth/start';
});

export default router;
