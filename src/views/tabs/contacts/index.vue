<template>
  <IonPage class="contacts-container">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="end">
          <ion-icon
            :icon="addOutline"
            size="large"
            v-if="!isAndroid"
            @click="openAddProfile"
          >
          </ion-icon>
          <ion-icon
            :icon="search"
            size="large"
            v-if="isAndroid && !searchIsAvailable"
            @click="setSearchable(true)"
          ></ion-icon>
          <ion-icon
            :icon="arrowBack"
            size="large"
            v-if="isAndroid && searchIsAvailable"
            @click="setSearchable(false)"
          ></ion-icon>
        </ion-buttons>
        <ion-buttons slot="start" class="title-input-container">
          <div class="toolbar-title" v-show="!searchIsAvailable">
            &nbsp; {{ t('tabs.contacts.title') }}&nbsp;
          </div>
          <ion-input
            v-show="isAndroid && searchIsAvailable"
            id="searchInputInHeader"
            :debounce="256"
            @ionInput="handelSearch($event.target.value)"
          ></ion-input>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <IonContent class="ion-padding-horizontal contacts-ion-content">
      <ion-refresher :pull-min="300" slot="fixed" @ionRefresh="refreshPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-fab
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        v-if="isAndroid"
        v-once
      >
        <ion-fab-button @click="openAddProfile">
          <ion-icon :icon="personAdd"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ContactsList
        :list="contactsList"
        @openContactProfileModal="openContactProfileModal"
        @handelGettingUserData="handelGettingUserData"
        @iosSearchInputEvent="handelSearch"
      ></ContactsList>
    </IonContent>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonFab,
  IonInput,
  IonFabButton,
  IonIcon,
  isPlatform,
  IonButtons,
  modalController,
  onIonViewDidEnter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { addOutline, personAdd, search, arrowBack } from 'ionicons/icons';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';

import { useI18n } from 'vue-i18n';
import AddContactModal from '@/components/contacts/add/index.vue';
import ProfileContactModal from '@/components/contacts/profile/index.vue';
import ContactsList from '@/components/contacts/list/index.vue';

const { t } = useI18n();
const contactsStore = useContactsStore();

const openAddProfile = async () => {
  const modal = await modalController.create({
    component: AddContactModal,
  });

  modal.present();

  const { role } = await modal.onWillDismiss();

  if (role === 'cancel') {
    // here should handel end call [process
  }
  if (role === 'confirm') {
    // here should handel end call [process
    contactsStore.getContactsList();
  }
};

const openContactProfileModal = async (contact) => {
  const fileManagerStore = useFileManagerStore();
  fileManagerStore.gettingAvatarsHandler(contact.avatarFileId, false);
  const modal = await modalController.create({
    component: ProfileContactModal,
    componentProps: {
      userId: contact.contact_username,
      name: contact.name,
      avatarFileId: contact.avatarFileId,
      avatarBackColor: contact.avatarClass,
      phoneNumber: contact.contact_phone,
    },
  });
  requestAnimationFrame(() => {
    modal.present();
  });
};

const isAndroid = computed(() => {
  return isPlatform('android');
});

const setSearchable = (val) => {
  searchIsAvailable.value = val;
  const element = document.body.querySelector(
    'body #searchInputInHeader input',
  );
  if (val) {
    setTimeout(() => {
      element.focus();
    }, 0);
    return;
  }
  element.value = '';
  handelSearch('');
};
const handelSearch = async (val) => {
  contactsStore.search = val;
};

let contactsList = computed(() => contactsStore.getListContacts);

const searchIsAvailable = ref(false);
const refreshPage = () => {
  location.reload();
};
onIonViewDidEnter(() => {
  userIdStatusSendRequestList = [];
});

let userIdStatusSendRequestList = [];
const handelGettingUserData = async (user) => {
  if (!user.contact_username) return;
  contactsStore.getUserProfile(user.contact_username, 'image', true);
  if (!userIdStatusSendRequestList.includes(user.contact_username)) {
    const status = await contactsStore.getUserOnlineStatus(
      user.contact_username,
    );
    user['lastSeen'] = status.time;
    userIdStatusSendRequestList.push(user.contact_username);
  }
};
</script>
<style scoped>
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

.font-farsi .contacts-container {
  direction: rtl;
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
