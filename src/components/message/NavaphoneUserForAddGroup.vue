<template>
  <div class="contact-container" @click="addToGroup">
    <img
      :src="gettingImage"
      alt="image"
      class="avatar-image"
      loading="lazy"
      v-if="gettingImage"
    />
    <div v-else>
      <div class="fristchar" :class="[item.avatarClass]" v-if="item.name">
        {{ item.name.slice(0, 1).toUpperCase() }}
      </div>
      <div class="fristchar" :class="[item.avatarClass]" v-else>
        {{ item.nickname.slice(0, 1).toUpperCase() }}
      </div>
    </div>

    <div class="check-container" v-if="memberInGroup">
      <img src="/Images/tabs/green-check.svg" alt="icon" />
    </div>

    <div class="content">
      <div class="user-information">
        <div class="user-information-title">
          {{ item.name }}
        </div>

        <div class="time">
          <span v-if="item.lastSeen">
            <span v-if="item.lastSeen.isYesterday">
              {{ t('tabs.contacts.lastSeen') }}&nbsp;{{
                t('tabs.contacts.yesterday')
              }}&nbsp;{{ item.lastSeen.value }}</span
            >
            <span v-else-if="item.lastSeen">
              {{ t('tabs.contacts.lastSeen', { time: item.lastSeen }) }}</span
            >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager';
import { useCreateGroup } from '@/store/createGroup/createGroup.js';

const fileManagerStore = useFileManagerStore();
const { t, locale } = useI18n();
const dir = ref('ltr');
const createGroupStore = useCreateGroup();

const props = defineProps({
  item: {
    type: Object,
  },
});

const gettingImage = computed(() => {
  if (props.item.avatarFileId) {
    const fileId = props.item.avatarFileId.split('.');
    const fileIdResult = fileId[0] ? fileId[0] : props.item.avatarFileId;
    const image = fileManagerStore.usersAvatarBlobList[fileIdResult];
    if (image && image.mainFile) return image.mainFile;
  }
});

const addToGroup = () => {
  createGroupStore.addMemberToGroup(props.item);
};

const memberInGroup = computed(() => {
  const list = createGroupStore.membersList
    .map((member) => member.contact_username)
    .includes(props.item.contact_username);
  return list;
});

onMounted(async () => {
  if (locale.value === 'fa') {
    dir.value = 'rtl';
  }
});
</script>

<style scoped>
.check-container {
  width: 25px;
  height: 22px;
  border-radius: 50%;
  background: #3fdd3c;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  z-index: 100;
  margin-top: 35px;
  margin-right: 22px;
}
.contact-container {
  padding: 5px 2px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}
.fristchar {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: #fff;
  font-size: 32px;
  font-weight: 500;
}
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  padding: 0px 10px;
}
.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.avatar-image-loaded {
  opacity: 1;
}
.avatar-image-loaded-without-anim {
  opacity: 1;
}
.user-information-title {
  direction: ltr;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 45vw;
}
.font-farsi .user-information-title {
  text-align: right;
}
.time {
  font-size: 12px;
  color: var(--ion-color-medium);
  min-height: 20px;
}
.hidden-char {
  /* opacity: 0; */
  transform: scale(0);
}
.firstchar-container {
  font-weight: bold;
  font-size: calc(30px - 1vmin);
  background-color: aqua;
}
</style>
