<template>
  <div class="slid-left-animation">
    <div class="back-container">
      <img src="/Images/tabs/arrow-black.svg" alt="icon" @click="back" />
    </div>
    <div class="container">
      <div class="content">
        <div class="upload-container">
          <ion-spinner
            name="circular"
            v-if="uploadLoading"
            style="width: 50px; height: 50px; margin: 0 15px"
          ></ion-spinner>
          <img
            :src="groupAvatar"
            class="group-avatar fade-animation"
            alt="image"
            v-if="groupAvatar"
          />
          <div
            class="upload-image-circle"
            v-if="!groupAvatar && !uploadLoading"
          >
            <label for="inputFileInProfileAndroid1">
              <img
                src="/Images/tabs/add-photo.svg"
                class="add-photo animated"
              />
            </label>
            <input
              type="file"
              hidden
              id="inputFileInProfileAndroid1"
              @change="updloadAvatar($event.target)"
            />
          </div>
        </div>
        <div class="input-container">
          <div style="display: flex">
            <input
              ref="input"
              class="name-input"
              :placeholder="t('tabs.message.enternamegroup')"
              v-model="groupNameValue"
            />
          </div>
          <div class="text-error-container" v-if="errorState">
            <span class="text-error">
              {{ $t('desktop.createGroupNameError') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="member-list-content">
      <span class="member-count">
        {{ $t('tabs.message.member') }} ( {{ numberOfGroupMembers }}
        {{ $t('tabs.message.person') }} )
      </span>

      <div class="members-container" dir="rtl">
        <memberGroupCard
          style="margin-top: 6px"
          v-for="member in memberList"
          :name="member.name"
          :blob="member.blob"
          :lastSeen="member.lastSeen"
          mode="desktop"
        />
      </div>
    </div>
  </div>

  <div class="floting-button-content-create" @click="createGroup">
    <img src="/Images/tabs/arrow-right.svg" alt="icon" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useCreateGroup } from '@/store/createGroup/createGroup.js';
import { useRouter } from 'vue-router';
import { useOverallChatsStore } from '@/store/chats/overall';
import { useGroupChat } from '@/store/chats/groupChat';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

import memberGroupCard from '@/components/message/memberGroupCard.vue';

const { t } = useI18n();
const uploadLoading = ref(false);
const createGroupStore = useCreateGroup();
const overallChatsStore = useOverallChatsStore();
const groupChatStore = useGroupChat();
const router = useRouter();
const groupNameValue = ref('');
const errorState = ref(false);
const nestedModalsDesktop = useNestedModalsDesktop();

const groupAvatar = computed(() => {
  if (createGroupStore.avatarBlob == '') {
    return false;
  } else {
    return createGroupStore.avatarBlob;
  }
});

const memberList = computed(() => {
  return createGroupStore.membersList;
});

const numberOfGroupMembers = computed(() => {
  return createGroupStore.membersList.length;
});

const updloadAvatar = async (event) => {
  uploadLoading.value = true;
  await createGroupStore.uploadingAvatar(event);
  uploadLoading.value = false;
};

const createGroup = async () => {
  if (groupNameValue.value.length == 0) {
    errorState.value = true;
  } else {
    errorState.value = false;
    createGroupStore.groupName = groupNameValue.value;
    await createGroupStore.creatingGroup();
    router.push('/desktop/message');
    const groupId = groupChatStore.currentGroup.group_id;
    overallChatsStore.desktopActiveChat = groupId;
    await groupChatStore.getGroupAvatar(groupId);
    await groupChatStore.getGroupTitle(groupId);
    await groupChatStore.getGroupMembersUid(groupId);
    await groupChatStore.loadedCurrentGroupMessages(groupId, 50);
    setTimeout(() => {
      nestedModalsDesktop.OTOChatRoom = false;
      nestedModalsDesktop.coreModal = true;
      nestedModalsDesktop.groupChatRoom = true;
      groupChatStore.inGroupChatRoomDesktop = true;
    }, 2000);
    const targetChat = overallChatsStore.chatsList.find((chat) => {
      return chat.chatId == groupId;
    });
    targetChat.badge = 0;
  }
};

const back = () => {
  createGroupStore.addNameActiveFlag = false;
};
</script>

<style scoped>
.floting-button-content-create {
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

.floting-button-content-create img {
  width: 20px;
  height: 20px;
}

.back-container {
  width: 100%;
  display: flex;
  justify-content: end;
}

.back-container img {
  width: 21px;
  height: 21px;
  margin: 5px 15px;
  transform: rotate(180deg);
  cursor: pointer;
}

.container {
  display: flex;
  flex-direction: column;
}
.content {
  width: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 20px;
  border: 1px solid #6f6a6a34;
  border-radius: 15px;
  padding: 10px;
}
.group-avatar {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  margin: 0 10px;
}
.name-input {
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 600;
  color: #575555;
}
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.upload-image-circle {
  width: 65px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #6e9fe9;
  border-radius: 50%;
  margin: 0 10px;
}
.add-photo {
  width: 35px;
  height: 45px;
  cursor: pointer;
  margin-top: 4px;
}
.input-container {
  width: 70%;
  display: flex;
  flex-direction: column;
}
.text-error-container {
  width: 100%;
  display: flex;
  justify-content: start;
}
.text-error {
  color: #f00;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.group-name-input {
  width: 100%;
  border: none;
  background: none;
  outline: none;
  border-bottom: 1px solid #3a3a3a;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin: 0 10px;
}
.error {
  border-bottom: 1px solid #f00;
}

.member-count {
  color: #06f;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.member-list-content {
  height: 55vh;
  padding: 0 24px;
  overflow-y: scroll;
}
</style>
