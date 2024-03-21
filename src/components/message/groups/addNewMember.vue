<template>
  <div class="index-container">
    <coreHeader width="100%" height="10vh">
      <template #headerContent>
        <div class="add-member-group-header">
          <div class="header-title-container" v-if="!searchStatus">
            <img
              src="/Images/tabs/arrow-right.svg"
              v-if="locale == 'fa'"
              alt="ion"
              @click="back"
            />
            <img
              src="/Images/tabs/arrow-left.svg"
              v-else
              alt="ion"
              @click="back"
            />
            <span class="header-title">
              {{ $t('tabs.message.group.addmember') }}
            </span>
          </div>
          <div
            class="search-container"
            v-if="!searchStatus"
            @click="activeSearchStatus"
          >
            <img
              src="/Images/tabs/search-white.svg"
              alt="icon"
              style="width: 25px; height: 25px"
            />
          </div>
          <div class="search-content" v-if="searchStatus">
            <input type="text" class="search-input" v-model="searchValue" />
            <img
              src="/Images/tabs/arrow-right.svg"
              v-if="locale == 'en'"
              alt="ion"
              @click="activeSearchStatus"
              style="width: 22px; height: 22px"
            />
            <img
              src="/Images/tabs/arrow-left.svg"
              v-if="locale == 'fa'"
              alt="ion"
              @click="activeSearchStatus"
              style="width: 22px; height: 22px"
            />
          </div>
        </div>
      </template>
    </coreHeader>
    
    <div class="group-member-container" dir="rtl">
      <span v-if="groupMembersClientList.length === 0">
        {{ $t('tabs.message.selectmembergroup') }}
      </span>
      <groupMemberChip
        class="animation"
        v-for="member in groupMembersClientList"
        :name="member.name"
        :avatar="member.firstChar"
        :blob="member.blob"
        v-else
        style="margin: 5px"
      />
    </div>

    <div dir="rtl" class="contact-list">
      <div v-for="item in contactsListDataSource" :key="item.id">
        <NavaphoneUserForAddGroup :item="item" />
      </div>
    </div>

    <div dir="rtl">
      <ion-fab
        style="margin: 20px 10px"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        v-once
      >
        <ion-fab-button @click="addMembersToCurrentGroup" dir="rtl">
          <img src="/Images/tabs/arrow-left.svg" alt="icon" />
        </ion-fab-button>
      </ion-fab>
    </div>
  </div>
</template>

<script setup>
import coreHeader from '@/components/desktop/coreHeader.vue';
import NavaphoneUserForAddGroup from '@/components/message/NavaphoneUserForAddGroup.vue';
import { ref } from 'vue';
import { useGroupChat } from '@/store/chats/groupChat.js';
import groupMemberChip from '@/components/message/groupMemberChip.vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();
import {
  modalController,
  IonFab,
  IonFabButton,
} from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';

const overallChatsStore = useOverallChatsStore();
const nestedModals = useNestedModals();
const groupChatStore = useGroupChat();
const searchStatus = ref(false);
const searchValue = ref('');

const activeSearchStatus = () => {
  searchStatus.value = !searchStatus.value;
  searchValue.value = '';
};

const contactsListDataSource = computed(() => {
  const list = groupChatStore.memberForAddToCurrentGroup;
  return list.filter((member) => {
    if (member.name) {
      return member.name.toLowerCase().match(searchValue.value.toLowerCase());
    }
  });
});

const groupMembersClientList = computed(() => {
  return overallChatsStore.groupMembersClient;
});

const back = () => {
  overallChatsStore.clearGroupMembersClient();
  nestedModals.closeAddMemberGroup();
  nestedModals.closeMessageDeatailModal();
};

const addMembersToCurrentGroup = async () => {
  groupChatStore.addMemberToCurrentGroup().then((res) => {
    modalController.dismiss();
  });
};

onMounted(() => {
  groupChatStore.filterByCurrentGroupMember();
});
</script>

<style scoped>
.index-container {
  height: 100vh;
  overflow: hidden;
}

.add-member-group-header {
  width: 100%;
  height: 10vh;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.header-title-container {
  width: 80%;
  display: flex;
  justify-content: start;
  align-items: center;
}

.search-container {
  width: 20%;
  display: flex;
  justify-content: end;
  align-items: center;
}

.search-content {
  width: 100%;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  background: none;
  border: none;
  outline: none;
}
.contact-list {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  padding-bottom: 40px;
  height: 90vh;
  overflow-y: scroll;
}
.header-content {
  display: flex;
  align-items: center;
}
.group-member-container {
  width: 100%;
  max-height: 200px;
  overflow-x: scroll;
  display: flex;
  flex-wrap: wrap;
  padding: 15px 15px;
  border-bottom: 1px solid #d3d3d3;
}
.group-member-container span {
  color: #888888;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
}
.toolbar-title {
  font-size: 32px;
}

.header-title {
  color: #fff;
  font-size: 25px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 0 10px;
}

.item {
  display: flex;
  margin-top: 10px;
}
.item span {
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 0 12px;
}

.animation {
  animation: 0.8s animation;
}

@keyframes animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
