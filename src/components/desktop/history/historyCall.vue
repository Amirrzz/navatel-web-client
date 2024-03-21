<template>
  <div class="call-container">
    <div
      class="avatar"
      :class="{
        'incoming-avatar': !item.isOutgoingCall,
        'outgoing-avatar': item.isOutgoingCall,
      }"
    >
      <span v-if="item.firstChar">{{ item.targetName[0] }}</span>
      <IonIcon
        icon="Images/tabs/call-history/avatar-outgoing.svg"
        v-else-if="item.isOutgoingCall"
      ></IonIcon>
      <IonIcon
        icon="Images/tabs/call-history/avatar-incoming.svg"
        v-else-if="!item.isOutgoingCall"
      ></IonIcon>
    </div>
    <div class="content">
      <div class="user-information">
        {{ item.targetName }}
      </div>
      <div class="call-information">
        <div class="icon">
          <IonIcon
            icon="Images/tabs/call-history/outgoing.svg"
            v-if="item.isOutgoingCall && !item.isMissedCall"
          ></IonIcon>
          <IonIcon
            icon="Images/tabs/call-history/miss-outgoing.svg"
            class="miss-icon"
            v-if="item.isOutgoingCall && item.isMissedCall"
            size="large"
          ></IonIcon>
          <IonIcon
            icon="Images/tabs/call-history/incoming.svg"
            v-if="!item.isOutgoingCall && !item.isMissedCall"
            size="large"
          ></IonIcon>
          <IonIcon
            icon="Images/tabs/call-history/miss-incoming.svg"
            class="miss-icon"
            v-if="!item.isOutgoingCall && item.isMissedCall"
            size="large"
          ></IonIcon>
        </div>
        <span class="date">
          <span v-if="item.dateOfCall">
            <span v-if="item.dateOfCall.isYesterday">
              {{ t('tabs.contacts.yesterday') }}&nbsp;{{
                item.dateOfCall.value
              }}</span
            >
            <span v-else> {{ item.dateOfCall }}</span>
          </span></span
        >
        <span class="duration">
          <span v-show="+item.duration.hours"
            >{{ t('tabs.callHistory.hour', { count: item.duration.hours }) }}
            {{ t('tabs.callHistory.and') }}
          </span>
          <span v-show="+item.duration.minutes">
            {{ t('tabs.callHistory.minute', { count: item.duration.minutes }) }}
            {{ t('tabs.callHistory.and') }}
          </span>
          <span v-show="+item.duration.seconds">
            {{ t('tabs.callHistory.second', { count: item.duration.seconds }) }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue';
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
  item: {
    type: Object,
  },
});
</script>

<style scoped>
.call-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 5px;
  cursor: pointer;
}
.font-farsi .call-container {
  direction: rtl;
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 60px;
  padding: 0 10px;
}

.avatar {
  font-size: 32px;
  min-width: 59px;
  min-height: 59px;
  max-width: 70px;
  max-height: 70px;
  border-radius: 50%;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.incoming-avatar {
  background-color: #da56fb;
}
.outgoing-avatar {
  background-color: #6876f0;
}
.user-information {
  font-size: 18px;
  font-weight: bold;
}
.call-information {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(177, 169, 169);
}

.call-information ion-icon {
  width: 15px;
  height: 15px;
  padding-top: 5px;
}
.call-information ion-icon.miss-icon {
  width: 22px;
  height: 22px;
}
.call-information ion-icon.miss-icon svg {
  fill: red;
}
</style>
