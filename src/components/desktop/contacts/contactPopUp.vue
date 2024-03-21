<template>
  <div class="pop-up-content" dir="rtl">
    <span @click="openRemoveContactModal">{{
      $t('desktop.deletenumber')
    }}</span>
  </div>
</template>

<script setup>
import { popoverController } from '@ionic/vue';
import { useNestedModalsDesktop } from '@/store/nestedModals/nestedModalsDesktop.js';

const nestedModalsDesktop = useNestedModalsDesktop();

const openRemoveContactModal = async () => {
  await popoverController.dismiss();
  nestedModalsDesktop.changeStatusRemoveContact(true);
};
</script>

<style scoped>
.pop-up-content {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: start;
  z-index: 1;
  background: #fff;
  border-radius: 5px;
  padding: 10px 0px;
  cursor: pointer;
}

.pop-up-content span {
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
</style>
