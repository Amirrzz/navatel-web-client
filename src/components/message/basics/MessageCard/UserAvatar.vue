<template>
  <div class="avatar-content">
    <div class="container" :class="[avatarClass]">
      <img
        v-if="gettingImage"
        :src="gettingImage"
        loading="lazy"
        alt="iamge"
        class="avatar-image"
      />
      <span v-else>{{ renderFristChar }}</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useFileManagerStore } from '@/store/fileManager/fileManager';

const props = defineProps({
  dataSource: {
    type: Object,
    default: {},
  },
});

const avatarClass = computed(() => {
  if (props.dataSource.avatarClass) {
    return props.dataSource.avatarClass;
  } else {
    const classes = [
      'avatar-color-1',
      'avatar-color-2',
      'avatar-color-3',
      'avatar-color-4',
      'avatar-color-5',
      'avatar-color-6',
    ];
    return getRandomClass(classes);
  }
});

const renderFristChar = computed(() => {
  if (props.dataSource.name) {
    return props.dataSource.name[0].toUpperCase();
  } else {
    return props.dataSource.nickname[0].toUpperCase();
  }
});

const gettingImage = computed(() => {
  if (props.dataSource.avatar) {
    const fileManagerStore = useFileManagerStore();
    const fileId = props.dataSource.avatar.split('.');
    const fileIdResult = fileId[0] ? fileId[0] : props.dataSource.avatar;
    const imageAvatar = fileManagerStore.usersAvatarBlobList[fileIdResult];
    if (imageAvatar && imageAvatar.thumbnailFile) {
      return imageAvatar.thumbnailFile;
    }
    return false;
  }
});

const getRandomClass = (arr) => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const item = arr[randomIndex];
  return item;
};

onMounted(async () => {
  if (props?.dataSource?.avatar) {
    const fileManagerStore = useFileManagerStore();
    const fileId = props.dataSource.avatar?.split('.');
    const fileIdResult = fileId[0] ? fileId[0] : props.dataSource.avatar;
    fileManagerStore.gettingAvatarsHandler(fileIdResult, true);
  }
});
</script>

<style scoped>
.avatar-content {
  display: flex;
  align-self: flex-end;
  margin-left: 0;
  margin-right: 10px;
}

.container {
  max-width: 40px;
  max-height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.avatar-image {
  max-width: 40px;
  max-height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
}

span {
  font-size: 22px;
  font-weight: 600;
}
</style>
