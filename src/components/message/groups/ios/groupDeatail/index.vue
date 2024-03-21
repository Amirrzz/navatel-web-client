<template>
  <div class="group-deatail-container">
    <div class="group-deatail-header">
      <div class="top-bar">
        <div class="more-container">
          <img
            v-if="userInfo.role != 'participant'"
            style="margin: 0 12px; width: 18px"
            src="/Images/tabs/edit-blue.svg"
            @click="openEditGroupTitleModal"
          />
        </div>
        <div class="back-container">
          <img
            style="margin: 4px 10px; width: 18px"
            src="/Images/tabs/arrow-right-blue.svg"
            @click="back"
          />
        </div>
      </div>
      <div class="content-container" dir="rtl">
        <img
          :src="groupAvatar"
          alt="image"
          v-if="hasAvatar"
          class="group-avatar-image"
        />
        <div class="group-avatar" v-else>
          {{ groupAvatar }}
        </div>
        <span class="group-title">
          {{ currentGroupInfo.title }}
        </span>
        <span class="group-member-count">
          {{ groupMembersDataSource.length }} {{ $t('tabs.message.group.member') }}
        </span>
      </div>
    </div>

    <div class="options-container">
      <div
        class="more-dropdown"
        :class="{ 'more-dropdown-dark': themeIsDark }"
        dir="rtl"
        v-if="moreDropDownStatus"
      >
        <div class="option-dropdown">
          <img src="/Images/tabs/search-gray.svg" alt="icon" />
          <span>{{ $t('tabs.message.group.searchmember') }}</span>
        </div>
        <div class="option-dropdown" @click="leaveGroup">
          <img src="/Images/tabs/leave-group-gray.svg" alt="icon" />
          <span>{{ $t('tabs.message.group.leavegroup') }}</span>
        </div>
      </div>
      <div class="option" :class="{ 'option-dark': themeIsDark }">
        <div class="icon">
          <img
            @click="muteStatus = !muteStatus"
            v-if="muteStatus"
            src="/Images/tabs/mute.svg"
            alt="icon"
            style="width: 25px"
          />
          <img
            @click="muteStatus = !muteStatus"
            v-else
            src="/Images/tabs/ring-blue.svg"
            alt="icon"
            style="width: 25px"
          />
        </div>
        <span v-if="muteStatus">{{ $t('tabs.message.group.unmute') }}</span>
        <span v-else>{{ $t('tabs.message.group.mute') }}</span>
      </div>
      <div class="option" :class="{ 'option-dark': themeIsDark }">
        <div class="icon">
          <img
            src="/Images/tabs/video-call-blue.svg"
            alt="icon"
            style="width: 25px"
          />
        </div>
        <span>{{ $t('tabs.message.group.videocall') }}</span>
      </div>
      <div
        class="option"
        :class="{ 'option-dark': themeIsDark }"
        @click="openMoreDropDown"
      >
        <div class="icon">
          <img
            src="/Images/tabs/more-blue.svg"
            alt="icon"
            style="width: 25px"
          />
        </div>
        <span>{{ $t('tabs.message.group.more') }}</span>
      </div>
    </div>

    <div style="margin-top: 20px; padding: 0 10px">
      <div
        class="members-conatainer"
        :class="{ 'members-conatainer-dark': themeIsDark }"
        dir="rtl"
      >
        <div
          v-if="userInfo.role != 'participant'"
          class="add-member-container"
          @click="openAddNewMemberToCurrentGroup"
        >
          <img src="/Images/tabs/person-add-blue.svg" alt="icon" />
          <span>{{ $t('tabs.message.group.addmember') }}</span>
        </div>

        <div style="margin-top: 15px">
          <memberGroup
            v-for="member in groupMembersDataSource"
            :name="member.name"
            :memberId="member.contact_username"
            :role="member.role"
            :avatarClass="member.avatarClass"
            :avatar="member.avatar"
            :nickname="member.nickname"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import addNewMemberModal from '@/components/message/groups/addNewMember.vue';
import editGroupNameModal from '@/components/message/groups/ios/editGroupName/index.vue';

import { useThemeStore } from '@/store/theme.js';
import { useUserStore } from '@/store/user/user.js';
import { useGroupChat } from '@/store/chats/groupChat';
import { modalController, isPlatform } from '@ionic/vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals';
import { computed, ref } from 'vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';

const memberGroup = defineAsyncComponent(() =>
  import('@/components/message/groups/memberGroupCard.vue'),
);

const themeStore = useThemeStore();
const nestedModalsStore = useNestedModals();
const groupChatStore = useGroupChat();
const userStore = useUserStore();
const moreDropDownStatus = ref(false);
const hasAvatar = ref(false);
const muteStatus = ref(false);
const overallChatsStore = useOverallChatsStore();

const userInfo = computed(() => {
  const user = groupChatStore.currentGroup.members.find((m) => {
    return m.contact_username == userStore.userId;
  });
  return user;
});

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const currentGroupInfo = computed(() => {
  return groupChatStore.currentGroup;
});

const groupMembersDataSource = computed(() => {
  return groupChatStore.currentGroup.members;
});

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

const openEditGroupTitleModal = async () => {
  const modal = await modalController.create({
    component: editGroupNameModal,
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
  }
};

const openMoreDropDown = () => {
  moreDropDownStatus.value = !moreDropDownStatus.value;
};

const openAddNewMemberToCurrentGroup = async () => {
  const modal = await modalController.create({
    component: addNewMemberModal,
  });

  modal.present();
  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
  }
};

const leaveGroup = () => {
  groupChatStore.leaveFromCurrentGroup().then(() => {
    nestedModalsStore.leaveGroupStatus();
    setTimeout(() => {
      overallChatsStore.getChatList();
    }, 1000);
  });
};
</script>

<style scoped>
.group-deatail-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: none;
}

.group-deatail-header {
  width: 100%;
  height: 185px;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
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

.content-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.group-title {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.group-member-count {
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: #afafaf;
}

.options-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 100px;
}

@keyframes open-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.more-dropdown {
  position: absolute;
  z-index: 1;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  background: #fff;
  padding: 5px 5px;
  margin: 30px 10px;
  animation: 0.5s open-animation;
  margin-top: 220px;
  margin-left: 100px;
}

.more-dropdown-dark {
  border: none;
  background: #202020;
}

.more-dropdown .option-dropdown {
  display: flex;
  padding: 10px 10px;
}

.more-dropdown .option-dropdown span {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 10px;
}

.option {
  padding: 1px 0;
  width: 70px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
}

.option-dark {
  border: 1px solid #383838;
}

.icon {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.option span {
  font-size: 14px;
  font-weight: 700;
  color: #564bf1;
  padding-bottom: 8px;
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
  background: #9ea7f1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.group-name-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.group-name-container span {
  color: #fff;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.group-name-container p {
  color: #fff;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.option-status {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.members-conatainer {
  width: 100%;
  height: 45vh;
  overflow-y: scroll;
  padding: 20px 20px;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
}

.members-conatainer-dark {
  border: 1px solid #383838;
}

::-webkit-scrollbar {
  width: 0px;
  border: 0px solid #f0f0f0;
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

.add-member-container {
  width: 100%;
  padding: 0px 15px;
  display: flex;
}

.add-member-container span {
  color: #06f;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 19px;
}

.member-card {
  width: 100%;
  display: flex;
  margin-top: 10px;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #7b91da;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  font-weight: 600;
  color: #fff;
}

.member-info {
  display: flex;
  flex-direction: column;
  padding: 0 15px;
}

.member-name {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.member-lastseen {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: #aaaaaa;
}
</style>
