<template>
  <IonPage>
    <coreHeader width="100%" height="10vh">
      <template #headerContent>
        <div class="message-tab-header">
          <div class="title-container">
            <span class="header-title">
              {{ $t('tabs.message.messenger') }}
            </span>
          </div>
          <div class="options-container">
            <img
              style="width: 20px"
              v-if="isAndroid"
              src="/Images/tabs/search-white.svg"
              alt="icon"
            />
            <img
              style="width: 20px"
              @click="openMessageDetail"
              v-else
              src="/Images/tabs/create.svg"
              alt="icon"
            />
          </div>
        </div>
      </template>
    </coreHeader>

    <ion-content>
      <ion-refresher :pull-min="300" slot="fixed" @ionRefresh="refreshPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ChatList :list="chatsList"> </ChatList>
      <ion-fab
        slot="fixed"
        vertical="bottom"
        :horizontal="languageIsEnglish ? 'end' : 'start'"
      >
        <ion-fab-button @click="openMessageDetail" v-if="isAndroid">
          <img src="/Images/tabs/pencil.svg" alt="icon" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </IonPage>
</template>

<script setup>
import coreHeader from '@/components/desktop/coreHeader.vue';
import { onBeforeMount } from 'vue';
import {
  IonPage,
  IonContent,
  IonFab,
  IonFabButton,
  isPlatform,
  IonRefresher,
  IonRefresherContent,
  onIonViewDidLeave,
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import ChatList from '@/components/message/list/index.vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { useOtoStore } from '@/store/chats/otoChat.js';

const nestedModals = useNestedModals();

const languageIsEnglish = computed(() => {
  const { locale } = useI18n();
  return locale.value == 'en';
});

const chatsList = computed(() => {
  const overallChatsStore = useOverallChatsStore();
  return overallChatsStore.getListChats;
});

const openMessageDetail = async () => {
  nestedModals.messagePageNavigateToMessageDeatail();
};

const isAndroid = computed(() => {
  return isPlatform('android');
});

const refreshPage = () => {
  location.reload();
};
function resetOTOChatId() {
  const OTOStore = useOtoStore();

  OTOStore.currentChatId = '';
}

onIonViewDidLeave(() => {
  resetOTOChatId();
});

onBeforeMount(() => {
  const groups = localStorage.getItem('groups');
  if (!groups) {
    const array = [];
    const json = JSON.stringify(array);
    localStorage.setItem('groups', json);
  }
});
</script>

<style scoped>
.message-tab-header {
  width: 100%;
  height: 10vh;
  display: flex;
  align-items: center;
  padding: 0 15px;
}
.message-tab-header .title-container {
  width: 50%;
  display: flex;
  justify-content: start;
}
.message-tab-header .options-container {
  width: 50%;
  display: flex;
  justify-content: end;
}
ion-toolbar {
  --min-height: 10vh;
  height: 10vh;
}
.toolbar-title {
  font-size: 32px;
}

.header-title {
  color: #fff;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.search-icon {
  margin-top: 8px;
}
ion-content {
  height: calc(70vh);
}
ion-content::part(scroll) {
  scrollbar-width: none;
  /* overflow-y: hidden; */
}
ion-content::part(scroll)::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}
</style>
