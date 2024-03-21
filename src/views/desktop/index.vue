<template>
  <div
    class="desktop-layout"
    :class="{ 'desktop-layout-dark': themeIsDark }"
    :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
  >
    <div class="sidebar">
      <HeaderDesktop />
      <Navigation />
      <div class="router-container">
        <ion-content>
          <ion-router-outlet :key="Route.fullPath"></ion-router-outlet>
        </ion-content>
      </div>
    </div>
    <div class="modals-container">
      <CoreModal v-if="coreModal" />
      <div class="logo" v-else>
        <img src="/Images/Navatel-Logo.png" />
        <span>{{ $t('desktop.welcome') }}</span>
      </div>
    </div>
    <FullScreenImageDesktop
      v-if="nestedModalsDesktop.fullScreenImageDesktop.state"
    />
    <ProfileModal v-if="nestedModalsDesktop.profile" />
    <AddContactModal v-if="nestedModalsDesktop.addContact.status" />
    <RemoveContactModal v-if="nestedModalsDesktop.removeContact" />
    <ContactProfileModal v-if="nestedModalsDesktop.contactProfile" />
    <CallPadModal v-if="nestedModalsDesktop.callPad" />
    <CallingModal
      v-if="showCallingModal && nestedModalsDesktop.callingModalState"
    />
    <audio preload="auto" webkit-playsinline playsinline loop ref="ringback">
      <source src="/audio/ringback.mp3" />
    </audio>
    <audio preload="auto" webkit-playsinline playsinline loop ref="holdAudio">
      <source src="/audio/hold.mp3" />
    </audio>
    <audio preload="auto" webkit-playsinline playsinline loop ref="ringtone">
      <source src="/audio/ringtone.mp3" />
    </audio>
  </div>
</template>

<script setup>
import CallingModal from '@/components/desktop/call/Calling.vue';
import FullScreenImageDesktop from '@/components/desktop/modals/FullScreenImageDesktop.vue';
import CallPadModal from '@/components/desktop/modals/callPad.vue';
import ProfileModal from '@/components/desktop/modals/profile.vue';
import AddContactModal from '@/components/desktop/modals/addContact.vue';
import RemoveContactModal from '@/components/desktop/modals/removeContact.vue';
import ContactProfileModal from '@/components/desktop/modals/contactProfile.vue';
import CoreModal from '@/components/desktop/modals/coreModal.vue';
import HeaderDesktop from '@/components/desktop/header.vue';
import Navigation from '@/components/desktop/navigation.vue';

import { useCdrStore } from '@/store/callHistory/callHistory.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { handelBrowserTabVisibilityChange } from '@/helpers/browserApis.js';
import { useCallStore } from '@/store/call/call.js';
import { useRTMStore } from '@/store/rtm/rtm.js';
import { IonRouterOutlet } from '@ionic/vue';
import { useThemeStore } from '@/store/theme.js';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeMount } from 'vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useRoute } from 'vue-router';
import { useOverallChatsStore } from '@/store/chats/overall';
import { userReseterStore } from '@/store/reset.js';
import { getBowserName, getOsOfUser } from '@/helpers/parser.js';
import { useUserStore } from '@/store/user/user.js';
import { onMounted, ref } from 'vue';

const nestedModalsDesktop = useNestedModalsDesktop();
const { locale } = useI18n();
const Route = useRoute();
const themeStore = useThemeStore();
const RTMStore = useRTMStore();
const overallChatsStore = useOverallChatsStore();
const contactsStore = useContactsStore();
const userStore = useUserStore();
const ringback = ref();
const holdAudio = ref();
const ringtone = ref();
const showCallingModalRef = ref();
const cdrStore = useCdrStore();

const showCallingModal = computed(() => {
  const callStore = useCallStore();
  return callStore.getCallModalStatus.showModal;
});

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const coreModal = computed(() => {
  return nestedModalsDesktop.coreModal;
});

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});
const setStateCssSizeOnResizeWindow = () => {
  const themeStore = useThemeStore();
  const themIsDark = themeStore.getThemeIsDark;
  const targetQueryElement = themIsDark ? 'body.dark' : ':root';
  const rootElement = document.querySelector(targetQueryElement);
  const rootElementStyles = getComputedStyle(rootElement);
  let sidebarSize = rootElementStyles.getPropertyValue('--sidebar-size');
  let chatCardSize = rootElementStyles.getPropertyValue('--chat-card-size');
  let chatCardVoiceSize = rootElementStyles.getPropertyValue(
    '--chat-card-voice-size',
  );
  sidebarSize = sidebarSize.replace('px', '');
  chatCardSize = chatCardSize.replace('vw', '');
  chatCardVoiceSize = chatCardVoiceSize.replace('vw', '');
  themeStore.setStateCssSize({
    sidebarSize,
    chatCardSize,
    chatCardVoiceSize,
  });
};
onBeforeMount(() => {
  overallChatsStore.desktopActiveChat = '';
});

onMounted(() => {
  const callStore = useCallStore();
  const overallStore = useOverallChatsStore();

  userStore.getCurrentUserProfile().then(() => {
    RTMStore.connect();
    callStore.register();
    setTimeout(() => {
      overallStore.getChatList();
      contactsStore.getContactsList();
      cdrStore.getCallHistory();
    }, 0);
  });
  callStore.setAudioTag(
    ringback.value,
    ringtone.value,
    holdAudio.value,
    showCallingModalRef,
  );

  import('@/registerServiceWorker.js')
    .then((module) => {
      const userStore = useUserStore();
      const browserName = getBowserName();
      const osName = getOsOfUser();
      module.registerHandler(
        userStore.userId,
        userStore.sessionToken,
        userStore.token,
        browserName,
        osName,
      );
    })
    .catch((e) => {});
  handelBrowserTabVisibilityChange();
  window.addEventListener('beforeunload', (event) => {
    const reseterStore = userReseterStore();
    reseterStore.setLengthForSaveInLocalStorage();
    const RTMStore = useRTMStore();
    RTMStore.disconnect();
  });
  window.addEventListener('resize', setStateCssSizeOnResizeWindow);
});
</script>

<style scoped>
.desktop-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #fff;
}

.desktop-layout-dark {
  background: #101010;
}

.sidebar {
  width: 380px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.router-container {
  width: 100%;
  height: 100vh;
  padding: 10px 0;
}

.modals-container {
  width: 100%;
  height: 100vh;
  background: rgba(236, 240, 248, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: hidden;
  overflow-x: hidden;
  position: sticky;
}
.modals-container .logo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.modals-container .logo img {
  width: 200px;
  height: auto;
}

.modals-container .logo span {
  font-size: 22px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-top: 20px;
}
</style>
