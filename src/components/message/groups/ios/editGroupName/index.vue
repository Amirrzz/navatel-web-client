<template>
  <div class="edit-group-name-container">
    <div class="group-deatail-header">
      <div class="top-bar">
        <div class="more-container"></div>
        <div class="back-container">
          <img
            style="margin: 4px 10px; width: 18px"
            src="/Images/tabs/arrow-right-blue.svg"
            @click="back"
          />
        </div>
      </div>
    </div>
    <div class="content-container" dir="rtl">
      <img
        :src="groupAvatar"
        alt="image"
        class="group-avatar-image"
        v-if="hasAvatar"
      />
      <div class="group-avatar" v-else>
        {{ groupAvatar }}
      </div>
      <div class="upload-photo" dir="rtl">
        <img src="/Images/tabs/camera.svg" alt="icon" @click="openFile" />
        <div class="text" @click="openFile">
          <span>{{ $t('tabs.message.group.selectavatar') }}</span>
        </div>
        <input
          type="file"
          style="display: none"
          ref="file"
          @change="updloadAvatar($event.target)"
        />
      </div>
    </div>

    <div class="form-container">
      <div class="form" :class="{ 'form-dark': themeIsDark }">
        <div class="input-name" dir="rtl">
          <input type="text" v-model="title" />
          <img
            src="/Images/tabs/pencil-gray.svg"
            alt="icon"
            @click="editGroupTitle"
          />
        </div>

        <div class="input-description" dir="rtl">
          <input type="text" />
          <img src="/Images/tabs/pencil-gray.svg" alt="icon" />
        </div>
      </div>
    </div>
    <ion-toast
      :is-open="toastIsOpen"
      message="نام گروه نمیتواند خالی باشد"
      :duration="5000"
      dir="rtl"
    ></ion-toast>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/store/theme.js';
import { useUserStore } from '@/store/user/user';
import { getFile } from '@/helpers/parser.js';
import { fileUploader } from '@/api/file/index.js';
import { useGroupChat } from '@/store/chats/groupChat';
import { modalController, IonToast } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';

const overallChatsStore = useOverallChatsStore();
const themeStore = useThemeStore();
const groupChatStore = useGroupChat();
const title = ref('');
const userStore = useUserStore();
const hasAvatar = ref('');
const file = ref();
const uploadLoading = ref(false);
const toastIsOpen = ref(false);

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const openFile = () => {
  file.value.click();
};

const updloadAvatar = async (event) => {
  uploadLoading.value = true;
  const fileId = await fileUploader(event.files[0]);
  const blobAvatar = await getFile(fileId, userStore.token, 'image');
  groupChatStore.currentGroup.avatar = blobAvatar.filePath;
  await groupChatStore.updateAvatar(fileId);
  uploadLoading.value = false;
};

const groupAvatar = computed(() => {
  if (groupChatStore.currentGroup.avatar == '') {
    hasAvatar.value = false;
    return groupChatStore.currentGroup.title.slice(0, 1).toUpperCase();
  } else {
    hasAvatar.value = true;
    return groupChatStore.currentGroup.avatar;
  }
});

const back = () => {
  modalController.dismiss();
};

const editGroupTitle = () => {
  if (title.value.length === 0) {
    toastIsOpen.value = true;
  } else {
    toastIsOpen.value = false;
    groupChatStore.editTitleGroup(title.value).then((res) => {
      setTimeout(() => {
        overallChatsStore.getChatList();
      }, 1000);
      modalController.dismiss();
    });
  }
};

onMounted(() => {
  title.value = groupChatStore.currentGroup.title;
});
</script>

<style scoped>
.edit-group-name-container {
  width: 100%;
}

.group-deatail-header {
  width: 100%;
  height: 75px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 10px;
}

.top-bar {
  width: 100%;
  display: flex;
}

.back-container {
  width: 50%;
  display: flex;
  justify-content: end;
}

.more-container {
  width: 50%;
  display: flex;
  justify-content: start;
}

.back-container span {
  color: #fff;
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.group-avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

.group-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #8377ee;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
}

.input-container {
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.input-container input {
  border: none;
  border-radius: 0;
  height: 30px;
  width: 100%;
  outline: none;
}

.upload-photo {
  display: flex;
  padding: 10px 36px;
}

.text {
  color: #0066ff;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-top: 10px;
  margin-left: 15px;
  margin-right: 15px;
}

.form-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 15px;
}

.form {
  width: 100%;
  border: 1px solid #d6d4d4;
  border-radius: 20px;
  display: flex;
  padding: 0 8px;
  flex-direction: column;
}

.form-dark {
  border: 1px solid #383838;
}

.input-name {
  margin: 10px 10px;
  padding: 5px 0;
  border-bottom: 1px solid #e2e2e2;
}

.input-name input {
  border: none;
  padding-bottom: 7px;
  outline: none;
  width: 95%;
  background: none;
  font-size: 18px;
  font-weight: 600;
}

.input-description {
  margin: 7px 10px;
}
.input-description input {
  border: none;
  outline: none;
  width: 95%;
  background: none;
  font-size: 18px;
  font-weight: 600;
}
</style>
