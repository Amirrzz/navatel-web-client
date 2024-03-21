<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <div class="delete-content" v-if="cdrStore.selectedCall.length != 0">
          <div class="icon-container">
            <img
              src="/Images/tabs/remove-white.svg"
              alt="icon"
              style="width: 25px; height: 25px"
              @click="handleRemoveCall"
            />
          </div>
          <div class="cancel-container">
            <ion-icon
              :icon="close"
              size="large"
              @click="cancelSelectState"
            ></ion-icon>
          </div>
        </div>
        <ion-buttons
          :slot="languageIsEnglish ? 'start' : 'end'"
          class="toolbar-title"
          v-else
        >
          &nbsp;{{ t('tabs.callHistory.title') }}&nbsp;
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <IonContent class="ion-padding-horizontal">
      <ion-refresher :pull-min="300" slot="fixed" @ionRefresh="refreshPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <div v-bind="containerProps" style="height: 85vh" class="list-container">
        <div v-bind="wrapperProps">
          <CallItem
            v-for="item in list"
            :key="item.index"
            style="height: 65px"
            :item="item.data"
          ></CallItem>
        </div>
      </div>
      <RemoveModal v-if="removeModalStatus" />
    </IonContent>
  </IonPage>
</template>

<script setup>
import { close } from 'ionicons/icons';
import {
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { useVirtualList } from '@vueuse/core';
import { computed } from 'vue';
import { useCdrStore } from '@/store/callHistory/callHistory.js';
import CallItem from '@/components/callhistory/list/item.vue';
import { useCallStore } from '@/store/call/call.js';
import RemoveModal from '@/components/callhistory/modal/remove.vue';

const { t, locale } = useI18n();
const cdrStore = useCdrStore();

const languageIsEnglish = computed(() => locale.value == 'en');

const getterList = computed(() => {
  const cdrStore = useCdrStore();
  return cdrStore.getCallHistoryList;
});

const { list, containerProps, wrapperProps } = useVirtualList(getterList, {
  // Keep `itemHeight` in sync with the item's row.
  itemHeight: 65,
  overscan: 10,
});

const makeCall = (callInformation) => {
  const callStore = useCallStore();
  let phone = callInformation.targetNumber;
  let displayName = callInformation.targetName;

  if (!phone.startsWith('98') && phone.length != 4)
    if (phone.length == 8) {
      phone = '9821' + phone;
    } else {
      phone = '98' + phone;
    }
  if (phone.length == 4) {
    phone = phone + '0000';
  }
  if (callInformation.type == 'free_call') {
    callStore.makeFreeCall(phone, null, displayName);
  } else {
    callStore.makeNavaCall(phone, null, displayName);
  }
};

const removeModalStatus = computed(() => {
  return cdrStore.removeModalStatus;
});

const cancelSelectState = () => {
  cdrStore.selectedCall = [];
  cdrStore.isSelected = false;
};

const handleRemoveCall = () => {
  cdrStore.removeModalStatus = true;
  cdrStore.isSelected = false;
};

const refreshPage = () => {
  location.reload();
};
</script>
<style scoped>
ion-toolbar {
  --min-height: 10vh;
  height: 10vh;
}
ion-title {
  font-size: 32px;
}
.toolbar-title {
  font-size: 25px;
}
.list-container {
  scrollbar-width: none;
  padding-bottom: 25vh;
}
.list-container::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none; /* Hide scrollbar in IE, Edge, and Firefox */
}
ion-content::part(scroll) {
  scrollbar-width: none;
  /* overflow-y: hidden; */
}
ion-content::part(scroll)::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}

.delete-content {
  width: 100%;
  display: flex;
}

.delete-content .icon-container {
  width: 50%;
  display: flex;
  justify-content: start;
  padding: 3px 20px;
}

.delete-content .cancel-container {
  width: 50%;
  display: flex;
  justify-content: end;
  padding: 0 20px;
}
</style>
