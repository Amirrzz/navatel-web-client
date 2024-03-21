<template>
  <div>
    <div
      class="contact-container slid-left-animation"
      :dir="rtlDesginHandler ? 'rtl' : 'ltr'"
    >
      <div v-if="createGroupStore.createGroupActiveFlag" class="fade-animation">
        <img
          v-if="memberInGroup"
          class="select-icon"
          src="/Images/tabs/selected.svg"
          alt="icon"
          @click="selectContact"
        />
        <img
          v-else
          class="select-icon"
          src="/Images/tabs/un-select.svg"
          alt="icon"
          @click="selectContact"
        />
      </div>
      <ion-text class="avatar" :class="[item.avatarClass]"
        >{{ item.firstChar }}
        <img
          v-if="gettingImage"
          class="avatar-image"
          :src="gettingImage"
          @load="imageProfileLoaded"
          @click="openProfileModal"
          @contextmenu="openPopUp($event)"
        />
      </ion-text>
      <div
        class="content"
        @click="openProfileModal"
        @contextmenu="openPopUp($event)"
      >
        <div class="user-information">
          <div
            class="user-information-title"
            :class="[
              {
                'text-direction-right': item?.textDirectionIsRight,
                'text-direction-left': item?.textDirectionIsRight == false,
              },
            ]"
          >
            {{ contactName }}
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
  </div>
</template>

<script setup>
import { IonText, popoverController } from '@ionic/vue';
import { computed, onMounted, defineProps, defineEmits, ref } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useI18n } from 'vue-i18n';
import { useContactsStore } from '@/store/contacts/contacts';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useCreateGroup } from '@/store/createGroup/createGroup.js';

const { t, locale } = useI18n();
import popUp from '@/components/desktop/contacts/contactPopUp.vue';

const nestedModalsDesktop = useNestedModalsDesktop();
const contactsStore = useContactsStore();
const createGroupStore = useCreateGroup();

const props = defineProps({
  item: {
    type: Object,
  },
  showLastSeen: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['getAddionalProfileInfo']);

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const memberInGroup = computed(() => {
  const list = createGroupStore.membersList
    .map((member) => member.contact_username)
    .includes(props.item.contact_username);
  return list;
});

const contactName = computed(() => {
  if (props.item.name) {
    if (props.item.name.length > 20) {
      return props.item.name.slice(0, 20) + '...';
    } else {
      return props.item.name;
    }
  }
});

const openProfileModal = async () => {
  contactsStore.updateSelectedConatct(props.item);
  nestedModalsDesktop.changeStatusContactProfile(true);
};

const openPopUp = async (event) => {
  event.preventDefault();
  const popover = await popoverController.create({
    component: popUp,
    event: event,
  });
  await popover.present();
  contactsStore.updateSelectedConatct(props.item);
};

const gettingImage = computed(() => {
  const avatarFileId = props.item.avatarFileId;
  const fileManagerStore = useFileManagerStore();
  const image = fileManagerStore.usersAvatarBlobList[avatarFileId];
  if (image && image.thumbnailFile) {
    return image.thumbnailFile;
  }
  return false;
});

const selectContact = () => {
  createGroupStore.addMemberToGroup(props.item);
};

onMounted(() => {
  emit('getAddionalProfileInfo', props.item);
});
</script>

<style scoped>
.select-icon {
  width: 20px;
  height: 20px;
}
.pop-up-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(158, 155, 155, 0);
  display: flex;
  overflow: hidden;
}

.pop-up-content {
  width: 180px;
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: 1;
  background: #fff;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
}

.pop-up-content span {
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.contact-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  cursor: pointer;
}
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  padding: 0px 0;
}
.avatar {
  font-size: 32px;
  min-width: 50px;
  min-height: 50px;
  max-width: 70px;
  max-height: 70px;
  border-radius: 50%;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}
.avatar-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  object-fit: cover;
}
.avatar-image-loaded {
  opacity: 1;
}
.avatar-image-loaded-without-anim {
  opacity: 1;
}
.user-information-title {
  direction: ltr;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 72vw;
}
.font-farsi .user-information-title {
  text-align: right;
}
.time {
  font-size: 12px;
  color: var(--ion-color-medium);
  min-height: 20px;
}
</style>
