<template>
  <IonPage>
    <IonContent :forceOverscroll="true">
      <div
        v-bind="containerProps"
        style="height: 85vh; margin-top: 5px"
        class="list-container"
      >
        <div v-bind="wrapperProps">
          <History
            v-for="item in list"
            :key="item.index"
            :item="item.data"
            @click="makeCall(item.data)"
          ></History>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonContent
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { useVirtualList } from '@vueuse/core';
import { computed } from 'vue';
import { useCdrStore } from '@/store/callHistory/callHistory.js';
import History from '@/components/desktop/history/historyCall.vue';
import { useCallStore } from '@/store/call/call.js';

const { t, locale } = useI18n();

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
  padding-right: 10px;
}
ion-content::part(scroll) {
  scrollbar-width: none;
  overflow-y: hidden;
}
ion-content::part(scroll) {
  scrollbar-width: none;
  overflow-y: hidden;
}
ion-content::part(scroll)::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}

::-webkit-scrollbar {
  width: 5px;
  border: 2px solid #2c2c2c;
  border-radius: 5px;
}

::-webkit-scrollbar-track {
  border-radius: 5px;
  background: #eeeeee;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: #cac8c8;
}
</style>
