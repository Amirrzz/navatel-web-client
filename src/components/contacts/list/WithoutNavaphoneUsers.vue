<template>
  <div class="contact-container">
    <ion-text class="avatar" :class="[item.avatarClass]">
      {{ item.firstChar }}
    </ion-text>
    <div class="content">
      <div
        class="user-information user-information-title"
        :class="[
          {
            'text-direction-right': item?.textDirectionIsRight,
            'text-direction-left': item?.textDirectionIsRight == false,
          },
        ]"
      >
        {{ item.name }}
      </div>
      <IonButton
        class="invite-button"
        size="small"
        shape="round"
        @click="sendInviteSms"
      >
        {{ t('tabs.contacts.inviteContactButton') }}
      </IonButton>
    </div>
  </div>
</template>
<script setup>
import { IonText, IonButton } from '@ionic/vue';
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
  item: {
    type: Object,
  },
});
const sendInviteSms = () => {
  const phoneNumber = props.item.contact_phone; // Example phone number if props.details?.contact_phone is undefined
  const invitationMessage = t('tabs.contacts.addContacts.smsInvitationMessage'); // Assuming t() is a translation function
  const smsLink = `sms:${phoneNumber}?&body=${invitationMessage}`;
  // Create an anchor element and simulate a click on it to trigger the SMS
  const smsAnchor = document.createElement('a');
  smsAnchor.href = smsLink;
  smsAnchor.style.display = 'none'; // Hide the anchor element
  document.body.appendChild(smsAnchor);

  smsAnchor.click(); // Simulate a click on the anchor to trigger the SMS application

  // Clean up: remove the anchor element from the DOM
  document.body.removeChild(smsAnchor);
};
</script>
<style scoped>
.contact-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  padding: 20px 0;
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
  opacity: 0;
  transition: 1s;
  object-fit: cover;
  
}
.avatar-image-loaded {
  opacity: 1;
}
.avatar-image-loaded-without-anim {
  opacity: 1;
}
.user-information-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 45vw;
  text-align: left;
}
.font-farsi .user-information-title {
  text-align: right;
}
</style>
