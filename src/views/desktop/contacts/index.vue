<template>
  <div>
    <div
      class="back-container"
      v-if="
        createGroupStore.createGroupActiveFlag &&
        !createGroupStore.addNameActiveFlag
      "
      @click="cancelCreateGroup"
    >
      <img src="/Images/tabs/arrow-black.svg" alt="icon" />
    </div>
    <AddNewGroup v-if="createGroupStore.addNameActiveFlag" />

    <div class="contact-desktop-container" v-else>
      <div
        v-if="createGroupStore.createGroupActiveFlag"
        class="search-contact-container fade-animation"
      >
        <input
          type="text"
          :placeholder="$t('desktop.search')"
          v-model="searchValue"
        />
        <img
          src="/Images/tabs/search-gray.svg"
          alt="icon"
          v-if="searchValue.length == 0"
        />
      </div>
      <div
        v-else
        class="add-contact-content fade-animation"
        @click="createContact"
      >
        <span>
          {{ $t('desktop.addnewcontact') }}
        </span>
        <ion-icon :icon="personAdd" style="color: #959798"></ion-icon>
      </div>
      <ContactsList
        :list="contactsListDataSource"
        @handelGettingUserData="handelGettingUserData"
      />
      <div
        class="floting-button-content-next"
        v-if="createGroupStore.createGroupActiveFlag"
        @click="next"
      >
        <img src="/Images/tabs/arrow-right.svg" alt="icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { personAdd } from 'ionicons/icons';
import { IonIcon, onIonViewDidEnter } from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useCreateGroup } from '@/store/createGroup/createGroup.js';
import { useRouter } from 'vue-router';

import ContactsList from '@/components/desktop/contacts/list.vue';
import AddNewGroup from '@/components/desktop/message/addNewGroup.vue';

const contactsStore = useContactsStore();
const nestedModalsDesktop = useNestedModalsDesktop();
const createGroupStore = useCreateGroup();
const router = useRouter();
const searchValue = ref('');

watch(searchValue, (oldValue, newValue) => {
  contactsStore.search = searchValue.value;
});

const contactsListDataSource = computed(() => {
  return contactsStore.getListContacts;
});

const createContact = () => {
  nestedModalsDesktop.changeStatusAddContact(true, 'create');
};
let userIdStatusSendRequestList = [];
onIonViewDidEnter(() => {
  userIdStatusSendRequestList = [];
});

const handelGettingUserData = async (user) => {
  if (!user.contact_username) return;
  contactsStore.getUserProfile(user.contact_username);
  if (!userIdStatusSendRequestList.includes(user.contact_username)) {
    const status = await contactsStore.getUserOnlineStatus(
      user.contact_username,
    );
    user['lastSeen'] = status.time;
    userIdStatusSendRequestList.push(user.contact_username);
  }
};

const next = () => {
  createGroupStore.addNameActiveFlag = true;
};

const cancelCreateGroup = () => {
  createGroupStore.createGroupActiveFlag = false;
  createGroupStore.membersList = [];
  createGroupStore.avatarBlob = '';
  router.push('/desktop/message');
};
</script>

<style scoped>
.back-container {
  width: 100%;
  display: flex;
  justify-content: end;
}

.back-container img {
  width: 21px;
  height: 21px;
  margin: 5px 15px;
  cursor: pointer;
  transform: rotate(180deg);
}
.floting-button-content-next {
  background: #428cff;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}

.floting-button-content-next img {
  width: 20px;
  height: 20px;
}

.floting-button-content-cancel {
  background: #428cff;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 70px;
}

.floting-button-content-cancel img {
  width: 18px;
  height: 18px;
}

.contact-desktop-container {
  padding: 10px 0px;
  padding-right: 10px;
  height: 100%;
  overflow-y: hidden;
}

.add-contact-content {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.add-contact-content span {
  font-size: 12px;
  font-weight: 600;
  color: #959798;
  padding-top: 5px;
  padding-left: 5px;
  padding-right: 5px;
}

.search-contact-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-contact-container input {
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.search-contact-container img {
  position: fixed;
  z-index: 99999;
  margin-right: 70px;
}

/* Scrollbar Custom Style */
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
