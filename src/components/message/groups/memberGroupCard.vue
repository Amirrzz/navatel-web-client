<template>
  <div class="member-card-container" @click="handleOpenDropDown($event)">
    <img
      class="member-profile-image"
      :src="profileUrl"
      alt="image"
      v-if="profileUrl"
      loading="lazy"
    />
    <div class="member-avatar-circle" :class="[color]" v-else>
      <span v-if="name">
        {{ name.slice(0, 1).toUpperCase() }}
      </span>
      <span v-else>
        {{ nickname.slice(0, 1).toUpperCase() }}
      </span>
    </div>

    <div class="member-info-container">
      <div class="name-content">
        <div class="name">
          <span> {{ memberNameHandler }} </span>
        </div>
        <div class="position">
          <span v-if="role == 'admin'">
            {{ $t('tabs.message.group.admin') }}
          </span>
          <span v-if="role == 'owner'">
            {{ $t('tabs.message.group.owner') }}
          </span>
        </div>
      </div>
      <span class="last-seen-text">
        {{ $t('tabs.message.lastseen') }}
      </span>
    </div>

    <div class="member-pop-up" v-if="optionMemberDropDwon">
      <div
        class="option-member-popup"
        :class="{ 'option-member-popup-dark': themeIsDark }"
        :style="{
          top: ` ${dropDownPosition.y}`,
          left: `${dropDownPosition.x}`,
        }"
      >
        <div class="option" @click="removeFromCurrentGroup">
          <img src="/Images/tabs/remove-icon.svg" alt="icon" />
          <span> {{ $t('tabs.message.group.deletefromgroup') }} </span>
        </div>
        <div
          v-if="role == 'admin'"
          class="option"
          @click="unAssignAdminRole"
          style="padding-bottom: 10px"
        >
          <img src="/Images/tabs/admin-role-icon.svg" alt="icon" />
          <span> {{ $t('tabs.message.group.unassignadminrole') }} </span>
        </div>
        <div
          class="option"
          @click="assignAdminRole"
          style="padding-bottom: 10px"
          v-else
        >
          <img src="/Images/tabs/admin-role-icon.svg" alt="icon" />
          <span> {{ $t('tabs.message.group.assignadminrole') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user/user.js';
import { getFile } from '@/helpers/parser.js';
import { useGroupChat } from '@/store/chats/groupChat';
import { useThemeStore } from '@/store/theme.js';
import { ref, computed, onMounted } from 'vue';

const groupChatStore = useGroupChat();
const themeStore = useThemeStore();
const userStore = useUserStore();
const profileUrl = ref('');
const color = ref('');
const dropDownPosition = ref({
  x: '0',
  y: '0',
});

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  nickname: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  blob: {
    type: String,
    default: '',
  },
  firstChar: {
    type: String,
    default: '',
  },
  memberId: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: '',
  },
  avatarClass: {
    type: String,
    default: '',
  },
  lastSeen: {
    type: String,
    default: '',
  },
});

const optionMemberDropDwon = ref(false);

const memberNameHandler = computed(() => {
  if (props.name) {
    if (props.name.length > 12) {
      return `...${props.name.slice(0, 12)}`;
    } else {
      return props.name;
    }
  } else {
    if (props.nickname.length > 12) {
      return `...${props.nickname.slice(0, 12)}`;
    } else {
      return props.nickname;
    }
  }
});

const userInfo = computed(() => {
  const user = groupChatStore.currentGroup.members.find((m) => {
    return m.contact_username == userStore.userId;
  });
  return user;
});

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const handleOpenDropDown = (event) => {
  if (userInfo.value.role == 'admin' || userInfo.value.role == 'owner') {
    if (props.role != 'owner') {
      optionMemberDropDwon.value = !optionMemberDropDwon.value;
      dropDownPosition.value.x = `${100}px`;
      dropDownPosition.value.y = `${event.y}px`;
    }
  }
};

const removeFromCurrentGroup = () => {
  const result = [];
  result.push(props.memberId);
  groupChatStore.removeMemberFromCurrentGroup(result);
};

const assignAdminRole = () => {
  const result = [];
  result.push(props.memberId);
  groupChatStore.addAdminRoleToMemberFromCurrentGroup(result);
};

const unAssignAdminRole = () => {
  const result = [];
  result.push(props.memberId);
  groupChatStore.removeAdminRoleToMemberFromCurrentGroup(result);
};

const getRandomClass = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const item = arr[randomIndex];
  return item;
};

onMounted(async () => {
  if (props.avatar) {
    const fileId = props.avatar.split('.');
    const fileIdResult = fileId[0] ? fileId[0] : props.avatar;
    const blob = await getFile(fileIdResult, userStore.token, 'image');
    profileUrl.value = blob.filePath;
  } else if (props.avatarClass) {
    color.value = props.avatarClass;
  } else {
    const classes = [
      'avatar-color-1',
      'avatar-color-2',
      'avatar-color-3',
      'avatar-color-4',
      'avatar-color-5',
      'avatar-color-6',
    ];
    color.value = getRandomClass(classes);
  }
});

</script>

<style scoped>
.member-card-container {
  width: 100%;
  display: flex;
  margin-top: 10px;
  position: relative;
}

.member-pop-up {
  width: 100%;
  height: 100vh;
  position: fixed;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(158, 155, 155, 0);
  overflow: hidden;
}

.option-member-popup {
  position: absolute;
  z-index: 1;
  padding: 15px 10px;
  border-radius: 10px;
  background: #fafafa;
  border: 1px solid #d3d2d2;
  display: flex;
  flex-direction: column;
  animation: 0.5s open-animation;
}

.option-member-popup-dark {
  border: none;
  background: #202020;
}

.option {
  display: flex;
  margin-top: 10px;
}

.option span {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 0 7px;
}

.member-avatar-circle {
  min-width: 55px;
  min-height: 55px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  font-weight: 600;
  color: #fff;
}

.member-profile-image {
  width: 55px;
  height: 55px;
  max-width: 55px;
  max-height: 55px;
  min-width: 55px;
  min-height: 55px;
  border-radius: 50%;
}

.member-info-container {
  width: 95%;
  display: flex;
  flex-direction: column;
  padding: 0 15px;
}

.name-content {
  width: 100%;
  display: flex;
}

.name-content .name {
  width: 53%;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding-top: 5px;
}

.name-content .position {
  width: 50%;
  display: flex;
  justify-content: end;
  color: #aaaaaa;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding-top: 5px;
}

.member-name {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.last-seen-text {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: #aaaaaa;
  padding-top: 8px;
}

@keyframes open-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
