<template>
  <div class="contacts-list-in-transfrom-container">
    <ion-content color="transparent">
      <ion-icon
        :icon="close"
        size="large"
        class="pad-on-close"
        @click="closeModal"
      />
      <div class="search-container">
        <ion-input
          mode="ios"
          id="searchInputInHeaderOfContactsListTransform"
          :debounce="256"
          @ionInput="handelSearch($event.target.value)"
        ></ion-input>
        <ion-icon
          :icon="search"
          size="large"
          color="white"
          @click="setSearchable(true)"
        ></ion-icon>
      </div>
      <div class="contacts-container" v-if="contactsList.length > 0">
        <div
          class="contacts"
          v-for="item in contactsList"
          :key="item.id"
          @click="emitToParent(item)"
        >
          <div class="avatar" :class="[item.avatarClass]">
            {{ item.name ? item.name[0] : item.name }}
            <img
              class="avatar-image"
              :src="item.profileInfo.image"
              @load="imageProfileLoaded"
              v-if="item?.profileInfo?.image"
            />
          </div>
          <div>
            {{ item.name }}
          </div>
        </div>
      </div>
    </ion-content>
  </div>
</template>
<script setup>
import { IonIcon, IonInput, modalController, IonContent } from '@ionic/vue';
import { computed, onUnmounted } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { close, search } from 'ionicons/icons';

const emit = defineEmits(['transferNumnerSelected']);
const contactsStore = useContactsStore();
let contactsList = computed(() => contactsStore.searchInNavaPhoneContactList);

const handelSearch = (val) => {
  contactsStore.searchExistInTransformContatcs = val;
};

const emitToParent = (val) => {
  modalController.dismiss(val, 'confirm');
};
const closeModal = () => {
  modalController.dismiss(null, 'cancel');
  contactsStore.searchExistInTransformContatcs = '';
};
const imageProfileLoaded = (event) => {
  const imageElement = event.target;
  const elementClassList = Array.from(imageElement.classList);
  if (!elementClassList.includes('avatar-image-loaded')) {
    imageElement.classList.add('avatar-image-loaded');
  }
};
onUnmounted(() => {
  contactsStore.searchExistInTransformContatcs = '';
});
</script>
<style scoped>
ion-content {
  --background: #4d545f;
}
.contacts-list-in-transfrom-container {
  position: relative;
  background-color: #4d545f;
  position: relative;
  min-height: 100dvh;
}
.pad-on-close {
  position: absolute;
  top: 2vw;
  right: 2vw;
  color: white;
}
.search-container {
  margin-top: 30px;
  font-size: 14px;
  padding: 0 10px;
  padding-top: 5px;
  margin-bottom: 10px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 2px solid white;
}
.contacts-container {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}
.contacts {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: calc(25% - 10px);
  padding: 0 10px;
  word-break: break-all;
  color: white;
  font-size: 13px;
}
.avatar {
  font-size: 32px;
  min-width: 50px;
  max-width: 70px;
  max-height: 70px;
  border-radius: 50%;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  width: 25vw;
  height: 25vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: 1s;
}
.avatar-image-loaded {
  opacity: 1;
}
.avatar-image-loaded-without-anim {
  opacity: 1;
}
</style>
