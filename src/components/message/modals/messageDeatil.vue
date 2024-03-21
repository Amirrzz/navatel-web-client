<template>
  <ion-page>
    <coreHeader width="100%" height="10vh">
      <template #headerContent>
        <div class="message-deatail-header">
          <img
            src="/Images/tabs/arrow-left.svg"
            alt="ion"
            v-if="locale == 'en'"
            @click="closeModal"
          />
          <img
            src="/Images/tabs/arrow-right.svg"
            alt="ion"
            v-if="locale == 'fa'"
            @click="closeModal"
          />
          <span class="header-title">
            {{ $t('tabs.message.sendmessage') }}
          </span>
        </div>
      </template>
    </coreHeader>

    <div class="ios-search" v-if="!isAndroid">
      <img class="search-icon" src="/Images/tabs/search.svg" alt="search" />
      <input
        class="ios-search-input"
        :placeholder="$t('tabs.message.search')"
      />
    </div>

    <div class="main-container" :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
      <div class="ion-padding">
        <div class="item" @click="openAddUserGroup">
          <img src="/Images/tabs/persons.svg" alt="icon" style="width: 23px" />
          <span>
            {{ $t('tabs.message.creategroup') }}
          </span>
        </div>

        <div class="item" style="margin-top: 17px">
          <img src="/Images/tabs/channel.svg" alt="icon" style="width: 23px" />
          <span>
            {{ $t('tabs.message.createchannel') }}
          </span>
        </div>

        <div class="item" style="margin-top: 17px">
          <img
            src="/Images/tabs/save-message.svg"
            alt="icon"
            style="width: 23px"
          />
          <span>
            {{ $t('tabs.message.savemessage') }}
          </span>
        </div>
      </div>

      <div class="line" style="margin-top: 10px"></div>

      <div dir="rtl" class="contact-list">
        <ContactsList
          :showLastSeen="false"
          :list="contactsListDataSource"
          @openContactProfileModal="openContactProfileModal"
          @handelGettingUserData="handelGettingUserData"
          :hasSearch="false"
        ></ContactsList>
      </div>

      <div dir="rtl">
        <ion-fab
          slot="fixed"
          vertical="bottom"
          horizontal="end"
          v-if="isAndroid"
          v-once
        >
          <ion-fab-button @click="openCreateContact">
            <ion-icon :icon="personAdd"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </div>
    </div>
  </ion-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import coreHeader from '@/components/desktop/coreHeader.vue';
import ContactsList from '@/components/contacts/list/index.vue';
import AddContactModal from '@/components/contacts/add/index.vue';
import ProfileContactModal from '@/components/contacts/profile/index.vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
const { locale } = useI18n();
import {
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  isPlatform,
  modalController,
} from '@ionic/vue';
import { computed, ref } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { personAdd } from 'ionicons/icons';

const contactsStore = useContactsStore();
const nestedModals = useNestedModals();

const contactsListDataSource = computed(() => {
  return contactsStore.getListContactsForMessages;
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

const openCreateContact = async () => {
  const modal = await modalController.create({
    component: AddContactModal,
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm') {
    contactsStore.getContactsList();
  }
};

const openContactProfileModal = async (contact) => {
  const modal = await modalController.create({
    component: ProfileContactModal,
    componentProps: {
      userId: contact.contact_username,
      name: contact.name || contact.nikcname,
      avatarFileId: contact.avatarFileId,
      avatarBackColor: contact.avatarClass,
      phoneNumber: contact.contact_phone,
    },
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();
};

let userIdSendRequestList = [];
let userIdStatusSendRequestList = [];

const handelGettingUserData = async (user) => {
  if (!user.contact_username) return;
  if (!userIdSendRequestList.includes(user.contact_username)) {
    contactsStore.getUserProfile(user.contact_username, 'image', true);
    userIdSendRequestList.push(user.contact_username);
  }
  if (!userIdStatusSendRequestList.includes(user.contact_username)) {
    const status = await contactsStore.getUserOnlineStatus(
      user.contact_username,
    );
    user['lastSeen'] = status.time;
    userIdStatusSendRequestList.push(user.contact_username);
  }
};

const isAndroid = computed(() => {
  return isPlatform('android');
});

const openAddUserGroup = async () => {
  nestedModals.messageDeatailNavigateToAddMemberToGroup();
};

const closeModal = () => {
  nestedModals.closeMessageDeatailModal();
};
</script>

<style scoped>
.message-deatail-header {
  height: 68px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.ios-search {
  display: flex;
}
.ios-search-input {
  width: 100%;
  text-align: center;
  border: none;
  outline: none;
  font-size: 13px;
  margin-top: 15px;
  position: relative;
  background: none;
}
.search-icon[data-v-96f38b11] {
  position: absolute;
  z-index: 1;
  margin-top: 16px;
  margin-left: 150px;
}
.main-container {
  height: 90vh;
  overflow: hidden;
}
.contact-list {
  padding: 0 12px;
  height: 67vh;
}
.line {
  border-bottom: 4px solid #d9d9d9;
}
.header-content {
  display: flex;
  align-items: center;
}
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
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
  padding: 0 10px;
}

.search-icon {
  margin-top: 8px;
}

.item {
  display: flex;
}
.item span {
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 0 12px;
}
</style>
