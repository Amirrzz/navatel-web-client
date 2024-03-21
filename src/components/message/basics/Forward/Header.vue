<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-buttons slot="end">
        <ion-icon
          :icon="search"
          size="large"
          v-show="!searchIsAvailable"
          @click="setSearchable(true)"
        ></ion-icon>
        <ion-icon
          :icon="arrowBack"
          size="large"
          v-show="searchIsAvailable"
          @click="setSearchable(false)"
        ></ion-icon>
      </ion-buttons>
      <ion-buttons slot="start" class="title-input-container">
        <ion-icon
          :icon="arrowBack"
          size="large"
          v-show="!searchIsAvailable"
          @click="modalController.dismiss()"
          class="arrow-close-modal"
        ></ion-icon>
        <div class="toolbar-title" v-show="!searchIsAvailable">
          &nbsp; {{ t('tabs.message.forward') }}
          &nbsp;
        </div>

        <ion-input
          v-show="searchIsAvailable"
          id="searchInputInHeaderOfForwarded"
          :debounce="256"
          @ionInput="handelSearch($event.target.value)"
        ></ion-input>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>
<script setup>
import {
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonInput,
  modalController,
} from '@ionic/vue';
import { ref } from 'vue';
import { search, arrowBack } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const searchIsAvailable = ref(false);

const setSearchable = (val) => {
  searchIsAvailable.value = val;
  const element = document.body.querySelector(
    'body #searchInputInHeaderOfForwarded input',
  );
};
const handelSearch = () => {};
</script>
<style scoped>
.font-farsi ion-header {
  direction: rtl;
}

ion-toolbar {
  --min-height: 10vh;
  height: 10vh;
}
ion-content {
  height: 70vh;
}
.toolbar-title {
  font-size: 25px;
}
ion-input {
  font-size: 20px;
}

.input-search-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.title-input-container {
  width: 80%;
}
.font-farsi .arrow-close-modal {
  transform: rotate(180deg);
}
</style>
