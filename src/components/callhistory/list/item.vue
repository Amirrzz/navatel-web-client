<template>
  <div
    class="call-container"
    @click="makeCall(item)"
    @contextmenu="handleSelectCall"
  >
    <div
      class="avatar"
      :class="{
        'incoming-avatar': !item.isOutgoingCall,
        'outgoing-avatar': item.isOutgoingCall,
      }"
    >
      <span v-if="item.firstChar">{{ item.firstChar }}</span>
      <IonIcon
        icon="Images/tabs/call-history/avatar-outgoing.svg"
        v-else-if="item.isOutgoingCall"
      ></IonIcon>
      <IonIcon
        icon="Images/tabs/call-history/avatar-incoming.svg"
        v-else-if="!item.isOutgoingCall"
      ></IonIcon>
      <div class="check-content" v-if="itemInSelectedList">
        <img
          src="/Images/tabs/green-check.svg"
          alt="icon"
          style="width: 10px; height: 10px"
        />
      </div>
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
import { defineProps, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCdrStore } from '@/store/callHistory/callHistory.js';
import { useCallStore } from '@/store/call/call.js';

const { t } = useI18n();
const cdrStore = useCdrStore();

const props = defineProps({
  item: {
    type: Object,
  },
});

const itemInSelectedList = computed(() => {
  const item = cdrStore.selectedCall
    .map((call) => call.id)
    .includes(props.item.id);
  return item;
});

const isSelected = computed(() => {
  return cdrStore.isSelected;
});

const handleSelectCall = () => {
  cdrStore.isSelected = true;
  cdrStore.addToSelectedCall(props.item);
};

const makeCall = (callInformation) => {
  const callStore = useCallStore();
  let phone = callInformation.targetNumber;
  let displayName = callInformation.targetName;

  if (isSelected.value) {
    cdrStore.addToSelectedCall(props.item);
  } else {
    if (!phone.startsWith('98') && phone.length != 4)
      if (phone.length == 8) {
        phone = '9821' + phone;
      } else {
        phone = '98' + phone;
      }
    if (phone.length == 4) {
      phone = phone + '0000';
    }
    if (callInformation.type == 'free_call') {
      callStore.makeFreeCall(phone, null, displayName);
    } else {
      callStore.makeNavaCall(phone, null, displayName);
    }
  }
};
</script>

<style scoped>
.check-content {
  width: 20px;
  height: 17px;
  border-radius: 50%;
  background: #3fdd3c;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
}
.call-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}
.font-farsi .call-container {
  direction: rtl;
}
.content {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
  width: 100%;
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
  max-height: 0px;
}

.call-information ion-icon {
  width: 15px;
  height: 15px;
  padding-top: 5px;
}
.call-information ion-icon.miss-icon {
  width: 25px;
  height: 30px;
}
.call-information ion-icon.miss-icon svg {
  fill: red;
}
</style>
