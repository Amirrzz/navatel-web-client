<template>
  <div class="content">
    <div class="item" @click="newMessage">
      <img src="/Images/tabs/new-message.svg" alt="icon" />
      <span>
        {{ $t('tabs.message.newmessage') }}
      </span>
    </div>

    <div class="item" @click="createGroup">
      <img src="/Images/tabs/persons.svg" alt="icon" />
      <span>
        {{ $t('tabs.message.creategroup') }}
      </span>
    </div>

    <div class="item">
      <img src="/Images/tabs/channel.svg" alt="icon" />
      <span>
        {{ $t('tabs.message.createchannel') }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { popoverController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useCreateGroup } from '@/store/createGroup/createGroup';

const router = useRouter();
const createGroupStore = useCreateGroup();

const newMessage = async () => {
  router.push('/desktop/contacts');
  const popover = popoverController;
  await popover.dismiss();
};

const createGroup = async () => {
  router.push('/desktop/contacts');
  const popover = popoverController;
  await popover.dismiss();
  createGroupStore.createGroupActiveFlag = true;
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  padding: 10px 0px;
  margin: 0 10px;
}

.content .item {
  display: flex;
  direction: rtl;
  cursor: pointer;
  padding: 7px 0;
}

.content .item span {
  font-size: 16px;
  font-weight: 600;
}

.content .item img {
  width: 18px;
  height: 18px;
  margin: 0 5px;
}
</style>
