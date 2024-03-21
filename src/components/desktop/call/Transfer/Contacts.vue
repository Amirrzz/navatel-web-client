<template>
  <div class="modal-container" @click.self="emit('close')">
    <div class="modal-content slid-left-animation">
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
          color="black"
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
    </div>
  </div>
</template>

<script setup>
import { IonIcon, IonInput, modalController } from '@ionic/vue';
import { computed, onUnmounted, defineEmits } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { close, search } from 'ionicons/icons';

const emit = defineEmits(['transferNumnerSelected', 'close']);
const contactsStore = useContactsStore();
let contactsList = computed(() => contactsStore.searchInNavaPhoneContactList);

const handelSearch = (val) => {
  contactsStore.searchExistInTransformContatcs = val;
};

const emitToParent = (val) => {
  modalController.dismiss(val, 'confirm');
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
.modal-container {
  direction: ltr;
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex !important;
  justify-content: end !important;
  align-items: center !important;
  background: rgba(0, 0, 0, 0) !important;
  padding: 0 20px;
}

.modal-content {
  width: 400px;
  max-height: 90vh;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  padding-bottom: 30px;
  padding-left: 20px;
  padding-right: 20px;
  overflow-y: scroll;
}

ion-content {
  --background: #4d545f;
}

.search-container {
  width: 100%;
  font-size: 16px;
  color: #4d545f;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid #4d545f;
}

.contacts-container {
  display: flex;
  align-items: start;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 20px;
}

.contacts {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 160px;
  padding: 0 10px;
  margin: 5px 10px;
  word-break: break-all;
  color: #4d545f;
  font-size: 16px;
  font-weight: 600;
  flex-wrap: wrap;
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
