<template>
  <div class="index-container">
    <coreHeader width="100%" height="10vh">
      <template #headerContent>
        <div class="header-container">
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
            {{ $t('tabs.message.newgroup') }}
          </span>
        </div>
      </template>
    </coreHeader>

    <div class="new-group-container" dir="rtl">
      <addGroupName
        v-model="groupName"
        :has-error="error.status"
        :text-error="error.text"
      />
    </div>

    <div class="divider"></div>

    <div class="member-container ion-padding" dir="rtl">
      <span class="member-count">
        {{ $t('tabs.message.member') }} ( {{ numberOfGroupMembers }}
        {{ $t('tabs.message.person') }} )
      </span>
    </div>

    <div class="ion-padding members-container" dir="rtl">
      <memberGroupCard
        style="margin-top: 6px"
        v-for="member in memberList"
        :name="member.name"
        :blob="member.blob"
        :lastSeen="member.lastSeen"
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
        <ion-fab-button @click="createGroup" dir="rtl">
          <img src="/Images/tabs/check.svg" alt="icon" />
        </ion-fab-button>
      </ion-fab>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import coreHeader from '@/components/desktop/coreHeader.vue';
import addGroupName from '@/components/message/addGroupName.vue';
import { useI18n } from 'vue-i18n';
import { IonFab, IonFabButton } from '@ionic/vue';
import { computed, ref, onMounted } from 'vue';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { useCreateGroup } from '@/store/createGroup/createGroup.js';

const memberGroupCard = defineAsyncComponent(() =>
  import('@/components/message/memberGroupCard.vue'),
);

const createGroupStore = useCreateGroup();
const overallChatsStore = useOverallChatsStore();
const dir = ref('ltr');
const { locale } = useI18n();
const nestedModals = useNestedModals();

onMounted(() => {
  if (locale.value == 'fa') {
    dir.value = 'rtl';
  }
});

const groupName = ref('');
const error = ref({
  status: false,
  text: '',
});

const createGroup = async () => {
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

const memberList = computed(() => {
  return createGroupStore.membersList;
});

const numberOfGroupMembers = computed(() => {
  return createGroupStore.membersList.length;
});

const back = () => {
  nestedModals.closeNewGroup();
  overallChatsStore.updateAvatarBlob('');
};
</script>

<style scoped>
.members-container {
  height: 70vh;
  overflow-y: scroll;
}
.index-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header-container {
  height: 10vh;
  display: flex;
  align-items: center;
  padding: 0 15px;
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
