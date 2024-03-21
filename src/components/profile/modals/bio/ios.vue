<template>
  <div class="ios-bio-username" @click.self="setDefaultStyle">
    <ion-header class="ios">
      <ion-toolbar color="transparent">
        <ion-buttons slot="start" @click="modalController.dismiss()">
          <ion-icon :icon="arrowBack" size="large" color="primary"> </ion-icon>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="bio-username-container ios">
      <div class="image-container" @click.self="setDefaultStyle">
        <img class="image" :src="avatar" v-if="avatar" />
        <div class="avatar" v-else>{{ userStore.getFirstChars }}</div>
      </div>
      <div class="content">
        <div class="name">{{ userStore.nickname }}</div>
        <div class="phone-number">{{ userStore.phoneNumber }}</div>
        <div class="bio">
          <div class="text">
            {{ userStore.bio ? userStore.bio : t('tabs.profile.bio') }}
          </div>
        </div>
      </div>
      <div
        class="options-part"
        :class="{
          'error-border': errors.username,
          'success-border': usernameResponseIsOk || bioResponseIsOk,
        }"
      >
        <div class="option-item">
          <ion-input
            type="text"
            :readonly="!nameIsEditing"
            ref="nameEditingInput"
            v-bind="username"
          >
          </ion-input>
          <label
            class="option-item-logo"
            @click="nameChnageStateEditing"
            v-show="!nameIsEditing"
          >
            <ion-icon icon="/Images/tabs/profile/edit.svg"></ion-icon>
          </label>
          <label
            class="option-item-logo"
            v-show="nameIsEditing && !isLoadingUsername"
            @click="updateUserName"
          >
            <ion-icon
              :icon="checkmark"
              :color="usernameResponseIsOk ? 'success' : ''"
            ></ion-icon>
          </label>
          <label class="option-item-logo" v-show="isLoadingUsername">
            <ion-spinner></ion-spinner>
          </label>
        </div>
        <div class="option-item-border"></div>
        <div class="option-item">
          <ion-input
            type="text"
            :readonly="!bioIsEditing"
            v-model="bio"
            ref="bioEditingInput"
          ></ion-input>

          <label
            type="button"
            class="option-item-logo"
            @click="bioChnageStateEditing"
            v-show="!bioIsEditing"
          >
            <ion-icon icon="/Images/tabs/profile/edit.svg"></ion-icon>
          </label>
          <label
            class="option-item-logo"
            v-show="bioIsEditing && !isLoadingBio"
            @click="updateBio"
          >
            <ion-icon
              :icon="checkmark"
              :color="bioResponseIsOk ? 'success' : ''"
            ></ion-icon>
          </label>
          <label class="option-item-logo" v-show="isLoadingBio">
            <ion-spinner></ion-spinner>
          </label>
        </div>
      </div>
      <div class="error-text-container" v-show="errors.username">
        {{ t('tabs.profile.usernameModal.NameRequired') }}
      </div>
    </ion-content>
  </div>
</template>

<script setup>
import {
  IonIcon,
  IonContent,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonSpinner,
  modalController,
  IonInput,
} from '@ionic/vue';
import { arrowBack, checkmark } from 'ionicons/icons';

import { ref, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/user/user.js';
import { useForm } from 'vee-validate';
import { object, string } from 'yup';

const emit = defineEmits(['updateBioModal']);

const { t } = useI18n();

const userStore = useUserStore();
const nameIsEditing = ref(false);
const bioIsEditing = ref(false);
const avatar = ref(userStore.avatar);
const bio = ref(userStore.bio);

const isLoadingUsername = ref(false);
const isLoadingBio = ref(false);

const usernameResponseIsOk = ref(false);
const bioResponseIsOk = ref(false);

const { errors, defineInputBinds, handleSubmit } = useForm({
  initialValues: {
    username: userStore.nickname || '',
  },
  validationSchema: object({
    username: string().required(t('tabs.profile.usernameModal.NameRequired')),
  }),
});
const username = defineInputBinds('username', {
  validateOnInput: true,
  validateOnBlur: true,
});
const nameEditingInput = ref();
function nameChnageStateEditing() {
  nameIsEditing.value = true;
  nameEditingInput.value.setFocus();
}
const bioEditingInput = ref();
const bioChnageStateEditing = () => {
  bioIsEditing.value = true;
  nameEditingInput.value.setFocus();
};
function validHandeler() {
  return true;
}
// second for when from is invalid
function inValidHandler(data) {
  throw data.errors;
}
// checkFormIsValid calling when validation is needed
const checkFormIsValid = handleSubmit(validHandeler, inValidHandler);

const updateUserName = () => {
  checkFormIsValid().then(() => {
    isLoadingUsername.value = true;
    userStore
      .setUserProfile({
        avatar: userStore.avatarFileId,
        nickname: username.value.value,
        phone_number: userStore.phoneNumber,
        username: userStore.userId,
      })
      .then(() => {
        userStore.getCurrentUserProfile().then(() => {
          isLoadingUsername.value = false;
          usernameResponseIsOk.value = true;
        });
      });
  });
};
const updateBio = () => {
  checkFormIsValid().then(() => {
    isLoadingBio.value = true;
    userStore
      .setUserStatus({
        uuid: userStore.userId,
        presence: bio.value,
        status: userStore.status,
      })
      .then(() => {
        userStore.getCurrentUserStatus();
        isLoadingBio.value = false;
        bioResponseIsOk.value = true;
      });
  });
};
const setDefaultStyle = () => {
  usernameResponseIsOk.value = false;
  bioResponseIsOk.value = false;
};
</script>

<style scoped>
ion-page {
  justify-content: flex-start;
}
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
  font-size: 32px;
  --border-width: 0 !important
;
}
ion-header {
  box-shadow: unset;
  direction: ltr;
  position: fixed;
}

ion-toolbar {
  direction: ltr !important;
  padding-left: 5px;
}

ion-title {
  font-size: 32px;
}
.ios-bio-username {
  height: 100%;
  height: 100%;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
}
.bio-username-container {
  margin-bottom: 5vw;
}
input {
  all: unset;
  height: 100%;
  width: 100%;
}
.font-farsi ion-toast {
  direction: rtl;
}
ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
  min-width: 15px;
  min-height: 15px;
  padding-top: 1px;
}

ion-header ion-icon {
  width: 30px;
  height: 30px;
}
.image-container {
  margin: 0 auto;
  margin-top: 24px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  color: white;
  font-weight: bold;
  overflow: hidden;
  position: relative;
}
.image {
  opacity: 1;
  position: relative;
  z-index: 4;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar {
  position: absolute;
  z-index: 2;
  background-color: #0066ff80;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  margin: 24px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.name {
  font-size: 24px;
}
.phone-number {
  font-size: 20px;
}
.bio {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.font-farsi .bio {
  direction: rtl;
}

.options-part {
  border: 1px solid #92949c91;
  margin: 24px 10px;
  padding-right: 10px;
  border-radius: 15px;
  margin-bottom: 5px;
}

.error-border {
  border-color: #ff0000;
}
.success-border {
  border-color: var(--ion-color-success);
}
.error-text-container {
  margin: 0 30px;
  font-size: 12px;
  color: #ff0000;
}
.font-farsi .options-part {
  direction: rtl;
}
.font-farsi .error-text-container {
  direction: rtl;
}
.option-item {
  display: flex;
  font-size: 20px;
  align-items: center;
  width: 100%;
  min-height: 56px;
  padding: 0 10px;
  justify-content: space-between;
}
.option-item-logo {
  width: 30px;
  height: 30px;
}
.option-item-logo svg {
  fill: #92949c91;
}
.option-item-border {
  height: 1px;
  width: calc(100% - 20px);
  border-bottom: 1px solid #92949c91;
  position: relative;
  margin: 0 10px;
}
</style>
