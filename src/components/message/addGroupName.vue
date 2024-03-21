<template>
  <div
    class="add-group-name-container"
    :class="{ 'ios-add-group-name-container': platform === 'ios' }"
  >
    <div class="upload-container">
      <ion-spinner
        name="circular"
        v-if="uploadLoading"
        style="width: 50px; height: 50px; margin: 0 15px"
      ></ion-spinner>
      <img
        :src="groupAvatar"
        class="group-avatar fade-animation"
        alt="image"
        v-if="groupAvatar"
      />
      <div class="upload-image-container" v-if="!groupAvatar && !uploadLoading">
        <label for="inputFileInProfileAndroid1">
          <ion-icon
            icon="Images/tabs//add-photo.svg"
            class="addPhoto animated"
          ></ion-icon>
        </label>
        <input
          type="file"
          hidden
          id="inputFileInProfileAndroid1"
          @change="updloadAvatar($event.target)"
        />
      </div>
    </div>

    <div class="input-container">
      <div style="display: flex">
        <input
          ref="input"
          :class="{
            error: hasError,
            'ios-group-name-input': platform === 'ios',
          }"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          class="group-name-input"
          :placeholder="t('tabs.message.enternamegroup')"
        />
        <img
          src="/Images/tabs/emojies.svg"
          alt="icon"
          @click="openAndCloseEmojies"
          style="
            position: absolute;
            z-index: 1;
            left: 30px;
            width: 17px;
            height: 17px;
          "
        />
      </div>
      <div class="text-error-container">
        <span class="text-error">
          {{ textError }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCreateGroup } from '@/store/createGroup/createGroup.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import { IonIcon } from '@ionic/vue';
import { computed, ref } from 'vue';

const createGroupStore = useCreateGroup();
const uploadLoading = ref(false);
const showEmojy = ref(false);

const groupAvatar = computed(() => {
  if (createGroupStore.avatarBlob == '') {
    return false;
  } else {
    return createGroupStore.avatarBlob;
  }
});

const openAndCloseEmojies = () => {
  showEmojy.value = !showEmojy.value;
};

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
    required: false,
  },
  hasError: {
    type: Boolean,
    default: false,
    required: false,
  },
  textError: {
    type: String,
    default: '',
    required: false,
  },
  platform: {
    type: String,
    default: '',
    required: false,
  },
});

const updloadAvatar = async (event) => {
  uploadLoading.value = true;
  await createGroupStore.uploadingAvatar(event);
  uploadLoading.value = false;
};
</script>

<style scoped>
.group-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 10px;
}
.add-group-name-container {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 70px 10px;
}
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.upload-image-container {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #6e9fe9;
  border-radius: 50%;
  margin: 0 10px;
}
.addPhoto {
  width: 32px;
  height: 32px;
}
.input-container {
  width: 70%;
  display: flex;
  flex-direction: column;
}
.text-error-container {
  width: 100%;
  display: flex;
  justify-content: start;
}
.text-error {
  color: #f00;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.group-name-input {
  width: 100%;
  border: none;
  background: none;
  outline: none;
  border-bottom: 1px solid #3a3a3a;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin: 0 10px;
}
.error {
  border-bottom: 1px solid #f00;
}
.ios-add-group-name-container {
  padding: 30px 0;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.ios-group-name-input {
  border-bottom: none;
  padding: 0 0px;
}
</style>
