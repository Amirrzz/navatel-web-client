<template>
  <div class="index-container">
    <ion-header>
      <ion-toolbar color="primary" style="padding: 0 15px">
        <div class="header-content" dir="rtl">
          <img src="/Images/tabs/arrow-right.svg" alt="ion" @click="back" />
          <span class="header-title">
            {{ $t('tabs.message.newgroup') }}
          </span>
        </div>
      </ion-toolbar>
    </ion-header>

    <div class="new-group-container" dir="rtl">
      <addGroupName
        v-model="groupName"
        :has-error="error.status"
        :text-error="error.text"
        platform="ios"
      />
    </div>

    <div class="ion-padding member-list-container" dir="rtl">
      <memberGroupCard
        v-for="member in memberList"
        :name="member.name"
        :avatar="member.firstChar"
        platform="ios"
      />
    </div>

    <div dir="rtl">
      <ion-fab
        style="margin: 20px 10px"
        slot="fixed"
        vertical="bottom"
        horizontal="end"
        v-once
      >
        <ion-fab-button @click="createGroupAndOpenChatRoom" dir="rtl">
          <img src="/Images/tabs/check.svg" alt="icon" />
        </ion-fab-button>
      </ion-fab>
    </div>
  </div>
</template>

<script setup>
import addGroupName from '@/components/message/addGroupName.vue';
import memberGroupCard from '@/components/message/memberGroupCard.vue';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { useCreateGroup } from '@/store/createGroup/createGroup.js';

import {
  IonHeader,
  IonToolbar,
  IonFab,
  IonFabButton,
} from '@ionic/vue';
import { computed, ref } from 'vue';
const nestedModals = useNestedModals();
const createGroupStore = useCreateGroup();

const groupName = ref('');
const error = ref({
  status: false,
  text: '',
});

const createGroupAndOpenChatRoom = async () => {
  if (groupName.value === '') {
    error.value.status = true;
    error.value.text = 'نام گروه نمیتواند خالی باشد';
  } else {
    error.value.status = false;
    error.value.text = '';
    createGroupStore.groupName = groupName.value;
    await createGroupStore.creatingGroup();
    nestedModals.newGroupNavigateToGroupChatRoom();
    setTimeout(() => {
      nestedModals.closeMessageDeatailModal();
    }, 1000);
  }
};

const memberList = computed(() => createGroupStore.membersList);

const back = () => {
  nestedModals.closeNewGroup();
};
</script>

<style scoped>
.index-container {
  height: 100vh;
  overflow: hidden;
}

.new-group-container {
  padding: 0 10px;
}

.member-list-container {
  height: 70vh;
  overflow-x: scroll;
}
.header-content {
  display: flex;
  align-items: center;
}
.divider {
  border-bottom: 4px solid #d9d9d9;
  margin-top: 10px;
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

.member-count {
  color: #06f;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
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
</style>
