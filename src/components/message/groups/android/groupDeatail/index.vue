<template>
  <div class="group-deatail-container" :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
    <coreHeader width="100%" height="185px">
      <template #headerContent>
        <div class="group-deatail-header">
          <div class="top-bar">
            <div class="more-dropdown" v-if="moreDropDownStatus">
              <div class="option">
                <img src="/Images/tabs/video-call-gray.svg" alt="icon" />
                <span>{{ $t('tabs.message.group.videocall') }}</span>
              </div>
              <div class="option">
                <img src="/Images/tabs/search-gray.svg" alt="icon" />
                <span> {{ $t('tabs.message.group.searchmember') }} </span>
              </div>
              <div class="option" @click="leaveGroup">
                <img src="/Images/tabs/leave-group-gray.svg" alt="icon" />
                <span>{{ $t('tabs.message.group.leavegroup') }} </span>
              </div>
            </div>
            <div class="more-container">
              <img
                style="margin: 4px 10px; width: 18px"
                src="/Images/tabs/arrow-right.svg"
                @click="back"
                v-if="locale == 'fa'"
              />
              <img
                v-else
                style="margin: 4px 10px; width: 18px"
                src="/Images/tabs/arrow-left.svg"
                @click="back"
              />
            </div>
            <div class="back-container">
              <img
                v-if="userInfo.role != 'participant'"
                style="margin: 0 12px; width: 18px"
                src="/Images/tabs/pencil.svg"
                @click="openEditGroupModal"
              />
              <img
                style="margin: 0 10px; width: 5px"
                src="/Images/tabs/more.svg"
                @click="openMoreDropDown"
              />
            </div>
          </div>
          <div class="content-container">
            <img
              :src="groupAvatar"
              alt="image"
              v-if="hasAvatar"
              class="group-avatar-image"
            />
            <div class="group-avatar" v-else>
              {{ groupAvatar }}
            </div>
            <div class="group-name-container">
              <span>
                {{ currentGroupInfo.title.slice(0, 12) }}
              </span>
              <p>
                {{ groupMembers.length }}
                {{ $t('tabs.message.group.member') }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </coreHeader>

    <div class="options-container">
      <div style="display: flex; width: 100%">
        <div style="display: flex; flex-direction: column; width: 50%">
          <span class="option-name">
            {{ $t('tabs.message.group.notification') }}
          </span>
          <span class="option-status">
            {{ $t('tabs.message.group.active') }}
          </span>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: end;
            width: 50%;
          "
        >
          <ion-toggle :checked="true"></ion-toggle>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="members-conatainer">
      <div
        v-if="userInfo.role != 'participant'"
        class="add-member-container"
        @click="openAddNewMemberToCurrentGroup"
      >
        <img src="/Images/tabs/person-add-blue.svg" alt="icon" />
        <span>{{ $t('tabs.message.group.addmember') }}</span>
      </div>

      <div style="margin-top: 10px">
        <memberGroup
          v-for="member in groupMembers"
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
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import coreHeader from '@/components/desktop/coreHeader.vue';
import addNewMemberModal from '@/components/message/groups/addNewMember.vue';
import editGroupNameModal from '@/components/message/groups/android/editGroupName/index.vue';

import { useThemeStore } from '@/store/theme.js';
import { useUserStore } from '@/store/user/user.js';
import { useI18n } from 'vue-i18n';
import { useGroupChat } from '@/store/chats/groupChat';
import { modalController, isPlatform } from '@ionic/vue';
import { computed, ref, onMounted } from 'vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals';

const memberGroup = defineAsyncComponent(() =>
  import('@/components/message/groups/memberGroupCard.vue'),
);

const themeStore = useThemeStore();
const groupChatStore = useGroupChat();
const userStore = useUserStore();
const moreDropDownStatus = ref(false);
const hasAvatar = ref(false);
const { locale } = useI18n();
const nestedModalsStore = useNestedModals();

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
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

const currentGroupInfo = computed(() => {
  return groupChatStore.currentGroup;
});

const groupMembers = computed(() => {
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

const userInfo = computed(() => {
  const user = groupChatStore.currentGroup.members.find((m) => {
    return m.contact_username == userStore.userId;
  });
  return user;
});

const isAndroid = computed(() => {
  return isPlatform('android');
});

const openEditGroupModal = async () => {
  const modal = await modalController.create({
    component: editGroupNameModal,
  });

  modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'cancel') {
  }
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

const openMoreDropDown = () => {
  moreDropDownStatus.value = !moreDropDownStatus.value;
};

const leaveGroup = () => {
  const userRoleInCurrentGroup = groupMembers.value.find((user) => {
    return user.contact_username == userStore.userId;
  });
  setTimeout(() => {
    nestedModalsStore.leaveGroupStatus();
  }, 100);
  groupChatStore.leaveFromCurrentGroup(userRoleInCurrentGroup.role);
};
</script>

<style scoped>
.display-none {
  display: none;
}
.group-deatail-container {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
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
  position: relative;
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
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: #242424;
  padding: 5px 5px;
  margin-top: 30px;
  margin-right: 180px;
  animation: 0.5s open-animation;
}

.more-dropdown .option {
  display: flex;
  padding: 10px 10px;
}

.more-dropdown .option span {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 10px;
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
  padding: 20px 20px;
}

.group-avatar-image {
  width: 90px;
  height: 90px;
  border-radius: 50%;
}

.group-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #9ea7f1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  font-weight: 600;
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

.options-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
}

.option-name {
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.option-status {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding-top: 7px;
}

.divider {
  width: 100%;
  height: 5px;
  background: #d9d9d9;
}

.members-conatainer {
  width: 100%;
  height: 70vh;
  overflow-y: scroll;
  padding: 20px 20px;
}

.add-member-container {
  width: 100%;
  padding: 5px 15px;
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
</style>
