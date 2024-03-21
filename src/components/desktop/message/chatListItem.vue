<template>
  <div
    class="chat-card fade-animation"
    :class="{ 'active-chat': detectActiveChat }"
  >
    <ion-text class="avatar" :class="[dataSource.avatarClass]"
      >{{ getFirstChar }}
      <img
        v-if="gettingImage"
        class="avatar-image"
        :src="gettingImage"
        @load="imageProfileLoaded"
      />
    </ion-text>
    <div class="chat-info" :class="{ 'chat-border': !detectActiveChat }">
      <div class="content">
        <span class="name" :class="{ 'active-chat-name': detectActiveChat }">
          {{ chatName }}
        </span>
        <div class="message-content">
          <div
            class="checker-content"
            style="margin-top: 2px"
            v-if="detectSenderMessage && detectTypeMessage"
          >
            <IonIcon
              v-if="item.lastSeenData.isSeen"
              color="primary"
              :icon="checkmarkDone"
              size="small"
            ></IonIcon>
            <IonIcon
              v-else
              :icon="checkmark"
              size="small"
              color="primary"
            ></IonIcon>
          </div>
          <span class="last-message">
            {{ lastMessage }}
          </span>
        </div>
      </div>
      <div class="badge-and-time-container">
        <span class="date-and-time" v-if="getFormatedDate.isYesterday">
          {{ $t('tabs.contacts.yesterday') }}</span
        >
        <span class="date-and-time" v-else> {{ getFormatedDate }}</span>

        <div class="badge-style" v-if="chatBadgeCount">
          {{ chatBadgeCount }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { IonText, IonIcon } from '@ionic/vue';
import { checkmark, checkmarkDone } from 'ionicons/icons';
import { useUserStore } from '@/store/user/user';
import { computed, onMounted, defineProps, defineEmits } from 'vue';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useLocaleStore } from '@/store/locale.js';
import { dateFormatterHandler } from '@/helpers/dateAndTimeFormatter.js';

const contactStore = useContactsStore();
const overallChatsStore = useOverallChatsStore();

const props = defineProps({
  item: {
    type: Object,
  },
});

const detectActiveChat = computed(() => {
  if (props.item.chatId) {
    if (overallChatsStore.desktopActiveChat == props.item.chatId) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
});

const detectTypeMessage = computed(() => {
  const mtype = props.item.lastMessageInfo.mtype;
  switch (mtype) {
    case 'grp.crt':
      return false;
      break;
    case 'grp.cfg.tit':
      return false;
      break;
    case 'grp.add':
      return false;
      break;
    case 'grp.rmv':
      return false;
      break;
    case 'grp.adm.add':
      return false;
      break;
    case 'grp.adm.rmv':
      return false;
      break;
    case 'grp.jnd':
      return false;
      break;
    case 'grp.lft':
      return false;
      break;
    case 'grp.avt':
      return false;
      break;
    default:
      return true;
      break;
  }
});

const getFirstChar = computed(() => {
  return dataSource.value.name ? dataSource.value.name[0] : '';
});

const getFormatedDate = computed(() => {
  const localeStore = useLocaleStore();
  const localeFormat = localeStore.getLocaleFormat;
  let dateString = props.item.date;
  if (dateString.toString().includes('UTC')) {
    const parts = dateString.split(' ');
    const datePart = parts[0];
    const timePart = parts[1].substring(0, 8);
    const fullDateString = `${datePart}T${timePart}Z`;
    // Create a Date object using the combined date string
    dateString = new Date(fullDateString).toString();
  }
  return dateFormatterHandler(dateString, localeFormat, {
    isFromMessages: true,
    isFromCallHistory: false,
  });
});

const dataSource = computed(() => {
  if (props.item.groupData) return props.item.groupData;
  const user = contactStore.contacts.navaphoneUsers.find(
    (e) => e.contact_username == props.item.chatId,
  );
  if (user) {
    return {
      ...user,
      name: props.item.information.name,
    };
  }
  return {
    avatarClass: props.item?.information?.avatarClass || 'avatar-color-2',
    name: props.item.information.name,
  };
});

const chatName = computed(() => {
  if (dataSource.value.name) {
    if (dataSource.value.name.length > 20) {
      return dataSource.value.name.slice(0, 20).concat('...');
    } else {
      return dataSource.value.name;
    }
  }
});

const lastMessage = computed(() => {
  if (props.item.lastMessageData.content) {
    if (props.item.lastMessageData.content.length > 25) {
      return props.item.lastMessageData.content.slice(0, 25).concat('...');
    } else {
      return props.item.lastMessageData.content;
    }
  }
});

const chatBadgeCount = computed(() => {
  if (props.item.badge) {
    if (props.item.badge > 99) {
      return '99+';
    } else {
      return props.item.badge;
    }
  }
});

const gettingImage = computed(() => {
  const fileManagerStore = useFileManagerStore();
  const profile =
    fileManagerStore.blobFilePathDownloadedList[props.item.chatId];
  if (profile) {
    return profile.filePath;
  }
  return false;
});

const detectSenderMessage = computed(() => {
  const userStore = useUserStore();
  if (props.item.groupData) {
    if (props.item.lastMessageInfo.from == userStore.userId) {
      return true;
    } else {
      return false;
    }
  } else {
    return props.item.isFromMe && !props.item.isMySelf;
  }
});

const emit = defineEmits([
  'getAddionalProfileInfo',
  'getGroupInformation',
  'getUserProfile',
]);

onMounted(() => {
  emit('getGroupInformation', props.item);
  emit('getAddionalProfileInfo', props.item);
  emit('getUserProfile', props.item);
});
</script>

<style scoped>
.checker-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
.date-and-time {
  color: rgb(164, 159, 159);
  font-size: 10px;
}
.active-chat {
  background: #0066ff3f;
}
.active-chat-name {
  font-weight: 700 !important;
}
.chat-card {
  width: 100%;
  padding: 2px 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  /* margin-top: 7px; */
  border-radius: 10px;
  transition: 0.5s;
}

.chat-card:hover {
  background: #8283863f;
}

.avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.chat-info {
  width: 80%;
  margin-left: 10px;
  margin-right: 10px;
  height: 60px;
  display: flex;
}

.chat-border {
  border-bottom: 1px solid #d4d4d4;
}

.chat-info:hover {
  border-bottom: 0px;
  transition: 0.5s;
}

.content {
  width: 200px;
  max-width: 200px;
  min-width: 150px;
  display: flex;
  flex-direction: column;
}
.name {
  font-size: 16px;
  padding: 5px 0;
  font-weight: 600;
}

.time {
  font-size: 12px;
  padding: 0px 2px;
  font-weight: 500;
  color: #9b9b9b;
}

.message-content {
  height: 20px;
  display: flex;
  align-items: center;
}

.badge-and-time-container {
  width: 80px;
  min-height: 60px;
  max-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: end;
}
.last-message {
  font-size: 10px;
  font-weight: 500;
  color: #9b9b9b;
  padding-top: 5px;
}

.time {
  font-size: 10px;
  font-weight: 500;
  color: #9b9b9b;
  padding-top: 5px;
}

.badge-style {
  border-radius: 50%;
  background: #0066ff;
  color: #fff;
  max-width: 22px;
  max-height: 22px;
  min-width: 22px;
  min-height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  margin-top: 10px;
}

.badge-fa {
  padding: 3px 6px;
}

.badge-en {
  padding: 6px 6px;
}
</style>
