<template>
  <div class="modal-container">
    <div class="modal">
      <coreHeader width="100%" height="85px">
        <template #headerContent>
          <div class="header">
            <div class="header-content">
              <span>
                {{ $t('desktop.removeContact') }}
              </span>
            </div>
          </div>
        </template>
      </coreHeader>

      <div class="options-container" :class="{ 'option-dark': themeIsDark }">
        <span>
          {{ $t('desktop.removeContactQuestion') }}
        </span>
        <div class="line"></div>
        <span @click="removeContact" style="cursor: pointer">
          {{ $t('desktop.removeContact') }}
        </span>
        <div class="line"></div>
        <span style="cursor: pointer" @click="closeModal">
          {{ $t('desktop.cancel') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/store/theme.js';
import coreHeader from '../coreHeader.vue';
import { computed } from 'vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';
import { useContactsStore } from '@/store/contacts/contacts.js';

const contactStore = useContactsStore();

const selectedContact = computed(() => {
  return contactStore.selectedConatct;
});

const nestedModalsDesktop = useNestedModalsDesktop();
const themeStore = useThemeStore();

const themeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const removeContact = async () => {
  await contactStore.removeContact(selectedContact.value);
  nestedModalsDesktop.changeStatusRemoveContact(false);
  contactStore.getContactsList();
};

const closeModal = () => {
  nestedModalsDesktop.changeStatusRemoveContact(false);
};
</script>

<style scoped>
.contact-info-container {
  width: 100%;
  display: flex;
  padding: 30px 30px;
}
.circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.circle-gray {
  width: 15vw;
  height: 15vw;
  min-width: 80px;
  min-height: 80px;
  max-width: 120px;
  max-height: 120px;
  background-color: #6d6d6db4;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.info-form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  justify-content: center;
}

.phone-number-container {
  direction: ltr;
  width: 100%;
  display: flex;
  padding: 0 45px;
  align-items: center;
}

.input {
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  border-bottom: 1px solid #b3b3b3;
  padding: 10px 0;
  margin-bottom: 5px;
}

.input-error {
  border-bottom: 1px solid #f00;
  color: #f00;
}

.text-error-content {
  color: #f00;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
@keyframes bg-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-animation {
  0% {
    margin-top: 800px;
  }
  100% {
    margin-top: 0;
  }
}
.modal-container {
  position: fixed;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00000095;
  animation: 0.3 bg-animation;
}

.modal {
  border-radius: 10px;
  overflow: hidden;
  width: 550px;
  background: #fff;
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  animation: 0.4s modal-animation;
}

.header {
  height: 85px;
  display: flex;
  padding: 0 15px;
}

.icon-container {
  padding-top: 10px;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content span {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.upload-file-container {
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.upload-file-container img {
  width: 26px;
}

.info {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.info .name {
  font-size: 19px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.info .status {
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.information .title {
  color: #06f;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.information .subtext {
  font-size: 11px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: #bebebe;
}

.information .text {
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding-top: 15px;
}

.options-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 15px;
  color: #101010;
  padding: 30px 0;
}

.options-container span {
  text-align: right;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.options-container .line {
  width: 100%;
  height: 1px;
  background: #b3b3b3;
  margin: 15px 0;
}

.option-dark {
  color: #fff;
}
</style>
