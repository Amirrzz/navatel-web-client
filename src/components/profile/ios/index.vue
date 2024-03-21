<template>
  <div class="information-part ios">
    <div
      class="image-container"
      :class="{ [userData.avatarBackColor]: !imageIsLoaded }"
    >
      <img
        class="image"
        :src="imageProfile || userData.avatar"
        v-if="imageProfile || userData.avatar"
        @load="imageLoaded"
      />
      <div class="avatar" v-else>{{ userData.getFirstChars }}</div>
      <div
        class="overlay"
        v-if="imageUploadingData.imageProfileInProfileTab"
        :style="computedOpacityForUploadingStyle"
      ></div>
      <div
        class="percentage"
        v-if="imageUploadingData.imageProfileInProfileTab"
      >
        <span>{{
          imageUploadingData.imageProfileInProfileTab.percentage
        }}</span>
        <span>%</span>
      </div>
    </div>
    <div class="content">
      <div class="name">
        {{ userData.nickname || t('tabs.profile.noName') }}
      </div>
      <div class="phone-number">{{ userData.phoneNumber }}</div>
      <div class="bio">
        <div class="text">
          {{ userData.bio ? userData.bio : t('tabs.profile.bio') }}
        </div>
      </div>
    </div>
  </div>

  <div class="options-part" v-if="showAction">
    <div class="option-item">
      <div class="option-item-logo">
        <ion-icon icon="/Images/tabs/profile/add_a_photo.svg"></ion-icon>
      </div>
      <input
        type="file"
        id="inputFileInProfile"
        hidden
        accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff"
        @change="onFileChange"
      />
      <label class="option-item-title" for="inputFileInProfile">
        {{ t('tabs.profile.selectPhoto') }}
      </label>
    </div>
    <div class="option-item-border"></div>
    <div
      class="option-item"
      @click="removeAvatar"
      v-if="userStore.avatar || imageProfile"
    >
      <div class="option-item-logo">
        <ion-icon icon="/Images/tabs/profile/delete.svg"></ion-icon>
      </div>
      <div class="option-item-title">
        {{ t('tabs.profile.options.deletePhoto') }}
      </div>
    </div>
    <div class="option-item-border"></div>
    <div class="option-item" @click="emit('updateBioModal')">
      <div class="option-item-logo">
        <ion-icon icon="/Images/tabs/profile/person.svg"></ion-icon>
      </div>
      <div class="option-item-title">
        {{ t('tabs.profile.changeUserName') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user/user.js';
import { IonIcon } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { useObjectUrl } from '@vueuse/core';
import { ref, shallowRef, computed, defineProps, defineEmits } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useErrorStore } from '@/store/errors.js';

const props = defineProps({
  userData: {
    type: Object,
    default: () => {
      return {
        avatar: '',
        nickname: '',
        phoneNumber: '',
        getFirstChars: '',
        status: '',
        bio: '',
        avatarBackColor: '',
      };
    },
  },
  showAction: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['updateBioModal']);

const { t } = useI18n();
const userStore = useUserStore();
const fileManagerStore = useFileManagerStore();
const imageIsLoaded = ref(false);
const imageProfile = ref();
const imageProfileIsLoading = ref(false);
const imageUploadingData = ref({});
const imageLoaded = () => {
  imageIsLoaded.value = true;
};
const onFileChange = (event) => {
  const inputFile = event.target.files[0];
  if (inputFile) {
    const file = shallowRef();
    file.value = event.target.files[0];
    imageProfile.value = useObjectUrl(file).value;
    imageProfileIsLoading.value = true;
    // userStore.avatar = useObjectUrl(file).value;
    fileManagerStore
      .uploadFile(inputFile, 'imageProfileInProfileTab', imageUploadingData)
      .then((result) => {
        userStore
          .setUserProfile({
            avatar: result,
            nickname: userStore.nickname,
            phone_number: userStore.phoneNumber,
            username: userStore.userId,
          })
          .then(() => {
            userStore.avatar = imageProfile.value;
          })
          .catch(() => {
            imageUploadingData.value = {};
            imageProfile.value = userStore.avatar;
            const errorStore = useErrorStore();
            errorStore.setErrors();
          });
      })
      .then(() => {
        userStore.avatar = imageProfile.value;
      })
      .catch(() => {
        imageUploadingData.value = {};
        imageProfile.value = userStore.avatar;
        const errorStore = useErrorStore();
        errorStore.setErrors();
      });
  }
};
const computedOpacityForUploadingStyle = computed(() => {
  return {
    opacity:
      1 - imageUploadingData.value.imageProfileInProfileTab.percentage / 100,
  };
});
const removeAvatar = () => {
  const userStore = useUserStore();
  userStore.avatar = null;
  imageProfile.value = null;
  userStore
    .setUserProfile({
      avatar: null,
      nickname: userStore.nickname,
      phone_number: userStore.phoneNumber,
      username: userStore.userId,
    })
    .then(() => {
      userStore.avatar = null;
      userStore.avatarFileId = null;
      imageProfile.value = null;
    })
    .catch(() => {
      const errorStore = useErrorStore();
      errorStore.setErrors();
    });
};
</script>
<style scoped>
ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
  min-width: 15px;
  min-height: 15px;
  padding-top: 1px;
}
.information-part {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.image-container {
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
.image-loaded {
  opacity: 1;
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

.overlay {
  height: 100%;
  width: 100%;
  background: #464444;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.1s;
  z-index: 5;
}
.percentage {
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5px;
  z-index: 6;
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
.font-farsi .options-part {
  direction: rtl;
}
.ios .options-part {
  border: 1px solid #92949c91;
  margin: 0 10px;
  margin-bottom: 24px;
  padding-right: 10px;
  border-radius: 15px;
}
.option-item {
  display: flex;
  gap: 10px;
  font-size: 20px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.option-item-logo {
  width: 30px;
  height: 30px;
}
.option-item-logo svg {
  fill: #92949c91;
}
.option-item-title {
  width: 100%;
  padding-top: 15px;
  padding-bottom: 10px;
  font-weight: bold;
}
.option-item-border {
  height: 1px;
  width: calc(100% - 20px);
  border-bottom: 1px solid #92949c91;
  position: relative;
  margin-right: 20px;
}
</style>
