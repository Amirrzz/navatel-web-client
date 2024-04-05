<template>
  <ion-page>
    <ion-tabs ref="hello">
      <ion-router-outlet mode="ios"></ion-router-outlet>
      <ion-tab-bar
        slot="bottom"
        color="secondary"
        :dir="languageIsEnglish ? 'ltr' : 'rtl'"
      >
        <div
          class="tab-item"
          @click="navigateBetweenTabs('/message')"
          :class="{ 'tab-selected': getRoutePath.includes('message') }"
        >
          <ion-icon icon="/Images/tabs/message.svg" class="tab-item-icon" />
          <ion-label>{{ t('tabs.message.title') }}</ion-label>
        </div>

        <div
          class="tab-item"
          @click="navigateBetweenTabs('/contacts')"
          :class="{ 'tab-selected': getRoutePath.includes('contacts') }"
        >
          <ion-icon icon="/Images/tabs/contacts.svg" class="tab-item-icon" />
          <ion-label>{{ t('tabs.contacts.title') }}</ion-label>
        </div>

        <div
          class="tab-item"
          @click="navigateBetweenTabs('/callpad')"
          :class="{
            'tab-selected': getRoutePath.includes('callpad') || !selectedTab,
          }"
        >
          <ion-icon icon="/Images/tabs/call-pad.svg" class="tab-item-icon" />
          <ion-label>{{ t('tabs.callpad.keypad') }}</ion-label>
        </div>

        <div
          class="tab-item"
          @click="navigateBetweenTabs('/history')"
          :class="{ 'tab-selected': getRoutePath.includes('history') }"
        >
          <ion-icon icon="/Images/tabs/history.svg" class="tab-item-icon" />
          <ion-label>{{ t('tabs.callHistory.history') }}</ion-label>
        </div>
        <div
          class="tab-item"
          @click="navigateBetweenTabs('/profile')"
          :class="{ 'tab-selected': getRoutePath.includes('profile') }"
        >
          <ion-icon icon="/Images/tabs/profile.svg" class="tab-item-icon" />
          <ion-label>{{ t('tabs.profile.title') }}</ion-label>
        </div>
      </ion-tab-bar>
    </ion-tabs>
    <ion-modal
      :is-open="showCallingModal"
      ref="showCallingModalRef"
      key="showCallingModal"
      id="calling-modal"
      @ionModalWillPresent="onOpenCallingModal"
      :animated="false"
    >
      <CallingModal></CallingModal>
    </ion-modal>
    <ion-modal :is-open="showVideoCallModal" key="showVideoCallModal">
      <VideoCallingModal></VideoCallingModal>
    </ion-modal>
    <audio preload="auto" webkit-playsinline playsinline loop ref="ringback">
      <source src="/audio/ringback.mp3" />
    </audio>
    <audio preload="auto" webkit-playsinline playsinline loop ref="holdAudio">
      <source src="/audio/hold.mp3" />
    </audio>
    <audio preload="auto" webkit-playsinline playsinline loop ref="ringtone">
      <source src="/audio/ringtone.mp3" />
    </audio>

    <NotificationModal></NotificationModal>
    <MicrophoneModal></MicrophoneModal>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
  IonModal,
} from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import CallingModal from '@/components/callpad/Calling.vue';
import VideoCallingModal from '@/components/callpad/VideoCalling.vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useCdrStore } from '@/store/callHistory/callHistory.js';
import { useUserStore } from '@/store/user/user.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useI18n } from 'vue-i18n';
import { useRTMStore } from '@/store/rtm/rtm.js';
import NotificationModal from '@/components/Permission/NotificationModal.vue';
import MicrophoneModal from '@/components/Permission/MicrophoneModal.vue';
import { useCallStore } from '@/store/call/call.js';
import { useVideoCallStore } from '@/store/videoCall/videoCall.js';
import { version } from '@/../package.json';
import { getBowserName, getOsOfUser } from '@/helpers/parser.js';
const { t, locale } = useI18n();
import { userReseterStore } from '@/store/reset.js';
import { handelBrowserTabVisibilityChange } from '@/helpers/browserApis.js';
import { useRouter, useRoute } from 'vue-router';
import { useOtoStore } from '@/store/chats/otoChat.js';

const userStore = useUserStore();
const contactsStore = useContactsStore();
const RTMStore = useRTMStore();
const cdrStore = useCdrStore();
const videoCallStore = useVideoCallStore();

const languageIsEnglish = computed(() => locale.value == 'en');
const hello = ref();
const showCallingModalRef = ref();
const ringback = ref();
const holdAudio = ref();
const ringtone = ref();
const showCallingModal = computed(() => {
  const callStore = useCallStore();
  if (callStore.getCallModalStatus.showModal) {
    return true;
  }
  return false;
});
const showVideoCallModal = computed(() => {
  return videoCallStore.showVideoCallModal;
});

const findHighestZIndexModal = () => {
  return new Promise((resolve, reject) => {
    const modals = document.querySelectorAll('ion-modal');
    let highestZIndex = 0;
    let elementWithHighestZIndex = null;
    modals.forEach((element) => {
      // Get the computed z-index
      let zIndex = window.getComputedStyle(element).zIndex;

      // Parse the z-index as an integer (remove 'auto')
      zIndex = parseInt(zIndex);

      // Check if the parsed zIndex is greater than the current highestZIndex
      if (zIndex > highestZIndex) {
        highestZIndex = zIndex;
        elementWithHighestZIndex = element;
      }
    });
    resolve({
      highestZIndex,
      element: elementWithHighestZIndex,
    });
  });
};
const onOpenCallingModal = async () => {
  const { highestZIndex } = await findHighestZIndexModal();
  if (showCallingModal.value) {
    showCallingModalRef.value.$el.style.opacity = '1';
    showCallingModalRef.value.$el.style.zIndex = highestZIndex + 1;
  }

  // Iterate through the NodeList
};
const router = useRouter();
const selectedTab = ref();
const navigateBetweenTabs = (link) => {
  selectedTab.value = link.replace('/', '');
  router.push(link);
};
const route = useRoute();
const getRoutePath = computed(() => {
  return route.path;
});
onMounted(() => {
  console.log(
    `%cVersion: ${version}`,
    'color: #ffffff; background-color: #428cff; padding: 8px; border-radius: 4px;',
    '\nThe UI has been implemented for mobile devices so far.\nDesign for desktop and tablet is currently under development.\n',
  );
  const callStore = useCallStore();
  const overallStore = useOverallChatsStore();
  const route = useRoute();
  selectedTab.value = route.path.replace('/', '');
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
    const OTOStore = useOtoStore();
    OTOStore.resetEachSizeChatMessages();
  });
});
</script>
<style scoped>
ion-tab-bar {
  height: 10vh;
  position: relative;
  z-index: 55;
}
ion-label {
  font-size: calc(14px - 1.2vmin);
}
div {
  background-color: transparent;
  color: #938d8d;
}
.tab-selected {
  color: var(--ion-color-primary);
  fill: var(--ion-color-primary);
}
.tab-selected ion-icon {
  fill: var(--ion-color-primary) !important;
  color: var(--ion-color-primary) !important;
}
.tab-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20%;
  gap: 5px;
}
.tab-item-icon {
  height: 6vw;
  width: 50px;
}
</style>
