<template>
  <IonPage>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons :slot="languageIsEnglish ? 'start' : 'end'">
          <span class="header-title">
            {{ t('auth.informationPage.title') }}
          </span>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :forceOverscroll="false" class="ion-padding">
      <div class="avatar-section">
        <div class="img-container">
          <img
            :src="getAvatar ? getAvatar : '/Images/avatar.svg'"
            alt="Avatar-Logo"
            :class="{ 'dark-img': isDark && !getAvatar }"
          />
        </div>
        <div class="w-50">
          <label for="inputFileInProfileAndroid1">
            <ion-icon
              icon="Images/tabs/profile/add_a_photo.svg"
              class="addPhoto"
            ></ion-icon>
          </label>
          <input
            type="file"
            hidden
            id="inputFileInProfileAndroid1"
            @change="onFileChange"
            accept=".jpg, .jpeg, .png, .gif, .bmp, .tiff"
          />
        </div>
        <div class="label">
          {{ t('auth.informationPage.avatar') }}
        </div>
      </div>
      <ion-row class="ion-align-items-center">
        <ion-col size="12" size-sm="6" size-md="4" offset-sm="3" offset-md="4">
          <main class="container">
            <ion-input
              type="text"
              v-bind="username"
              :label="t('auth.informationPage.username')"
              label-placement="stacked"
              fill="outline"
              class="border-gray mb-30"
              :class="{
                'ion-touched': errors.username,
                'ion-invalid': errors.username,
              }"
              :error-text="errors.username"
              :dir="languageIsEnglish ? 'ltr' : 'rtl'"
              @keyup.enter="submitForm"
              enterkeyhint="done"
            >
            </ion-input>
            <ion-button expand="block" @click="submitForm" class="m-0">
              <span v-if="!isLoading">{{
                t('auth.informationPage.button')
              }}</span>
              <ion-spinner v-else></ion-spinner>
            </ion-button>
          </main>
        </ion-col>
      </ion-row>
    </ion-content>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonInput,
  IonRow,
  IonCol,
  IonSpinner,
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/store/theme.js';
import { useUserStore } from '@/store/user/user.js';
import { useForm } from 'vee-validate';
import { object, string } from 'yup';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useRouter } from 'vue-router';

const router = useRouter();

const { t, locale } = useI18n();
const userStore = useUserStore();
const fileManagerStore = useFileManagerStore();

const isDark = ref(false);
const getCurrentThemeIsDark = computed(() => {
  const themeStore = useThemeStore();
  return themeStore.getThemeIsDark;
});

const languageIsEnglish = computed(() => locale.value == 'en');
const getAvatar = computed(() => {
  const userStore = useUserStore();
  return avatar.value || userStore.avatar;
});

onMounted(() => {
  userStore.getCurrentUserProfile();
  isDark.value = getCurrentThemeIsDark.value;
});

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
});

function validHandeler() {
  return true;
}
// second for when from is invalid
function inValidHandler(data) {
  throw data.errors;
}
// checkFormIsValid calling when validation is needed
const checkFormIsValid = handleSubmit(validHandeler, inValidHandler);

const isLoading = ref(false);
const submitForm = () => {
  checkFormIsValid().then(() => {
    isLoading.value = true;
    const userStore = useUserStore();
    if (inputFile.value) {
      fileManagerStore
        .uploadFile(
          inputFile.value,
          'imageProfileInProfileTab',
          imageUploadingData.value,
        )
        .then((result) => {
          updateUserInfo(result);
        });
    } else {
      updateUserInfo(userStore.avatarFileId);
    }
  });
};

const updateUserInfo = (avatarID) => {
  userStore
    .setUserProfile({
      avatar: avatarID,
      nickname: username.value.value,
      phone_number: userStore.phoneNumber,
      username: userStore.userId,
    })
    .then((res) => {
      setTimeout(() => {
        userStore.getCurrentUserProfile();
      }, 0);
    })
    .finally(() => {
      isLoading.value = false;
      router.push('/callpad');
    });
};

const imageUploadingData = ref();
const inputFile = ref('');

const avatar = ref(null);
const onFileChange = (event) => {
  inputFile.value = event.target.files[0];
  avatar.value = URL.createObjectURL(inputFile.value);
};
</script>

<style scoped>
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
}
.header-title {
  font-size: 20px;
  text-align: center;
  margin-right: 10px;
  margin-left: 10px;
}
.w-full {
  width: 100%;
}
ion-content ion-icon {
  width: 100%;
  height: 100%;
  fill: #92949c;
}

.font-farsi .avatar-section {
  direction: rtl;
}
.avatar-section {
  margin-bottom: 30px;
  display: flex;
}
.avatar-section .img-container {
  width: 100px;
  height: 100px;
}
.avatar-section .img-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-section .dark-img {
  filter: invert(1);
}
.avatar-section .w-50 {
  width: 60px;
  padding: 10px;
}
.avatar-section .label {
  display: flex;
  align-items: center;
  color: #06f;
  font-weight: 700;
}
.avatar-section .addPhoto {
  fill: #06f;
}
.text-align-left input {
  direction: ltr !important;
}
.text-align-right input {
  direction: rtl !important;
}
ion-input {
  border-radius: 40px;
}
ion-content::part(scroll) {
  scrollbar-width: none;
  overflow-y: hidden;
}
ion-content::part(scroll)::-webkit-scrollbar {
  width: 0.1rem; /* Chrome/Safari/Webkit */
  display: none;
}
.m-0 {
  margin: 0;
}
</style>
