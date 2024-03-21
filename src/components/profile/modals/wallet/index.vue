<template>
  <div dir="rtl">
    <coreHeader width="100%" height="10vh">
      <template #headerContent>
        <div class="wallet-header-container">
          <img
            src="/Images/tabs/arrow-right.svg"
            v-if="locale == 'fa'"
            alt="ion"
            @click="back"
          />
          <img
            src="/Images/tabs/arrow-left.svg"
            v-else
            alt="ion"
            @click="back"
          />
          <span class="header-title">
            {{ t('tabs.profile.wallet.title') }}
          </span>
        </div>
      </template>
    </coreHeader>

    <div class="wallet-container" :dir="rtlDesginHandler ? 'rtl' : 'ltr'">
      <span class="validity-black-text">
        {{ $t('tabs.profile.wallet.validity') }}
      </span>
      <div class="user-validity-container">
        <div class="user-validity-text">
          <span>
            {{ $t('tabs.profile.wallet.validity') }}
          </span>
        </div>
        <div class="user-validity text-align-left">
          <span> {{ userCredit }} {{ $t('tabs.profile.wallet.toman') }} </span>
        </div>
      </div>
      <div class="add-validity-container" @click="openAddCreditModal">
        <span>
          {{ $t('tabs.profile.wallet.addvalidity') }}
        </span>
      </div>
      <div class="gift-code-container">
        <span>
          {{ $t('tabs.profile.wallet.giftcode') }}
        </span>
      </div>
    </div>
  </div>
  <AddCreditModal v-if="addCreditModalStatus" />
</template>

<script setup>
import coreHeader from '@/components/desktop/coreHeader.vue';
import { isPlatform, modalController } from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { useWalletStore } from '@/store/wallet/wallet.js';
import AddCreditModal from '@/components/profile/modals/wallet/addCredit.vue';

const walletStore = useWalletStore();
const { t, locale } = useI18n();

const rtlDesginHandler = computed(() => {
  {
    if (locale.value == 'fa') {
      return true;
    } else {
      return false;
    }
  }
});

const userCredit = computed(() => {
  return walletStore.userCredit;
});

const addCreditModalStatus = computed(() => {
  return walletStore.addCreditModalStatus;
});

const openAddCreditModal = async () => {
  walletStore.updateAddCreditModalStatus(true);
};

const back = () => {
  walletStore.resetClientCredit();
  walletStore.updateAddCreditModalStatus(false);
  modalController.dismiss();
};

onMounted(() => {
  walletStore.getCredit();
});
</script>

<style scoped>
.wallet-header-container {
  width: 100%;
  height: 68px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.wallet-container {
  width: 100%;
  padding: 25px 20px;
}
ion-toolbar {
  --min-height: 10vh;
  --max-height: 95px;
}
.header-title {
  color: #fff;
  font-size: 22px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 0 10px;
}
.text-align-right {
  text-align: right;
  direction: rtl;
}
.text-align-left {
  text-align: left;
}
.validity-black-text {
  color: #06f;
  text-align: right;
  font-family: Yekan Bakh FaNum;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.user-validity-container {
  width: 100%;
  display: flex;
  margin-top: 20px;
}
.user-validity-text {
  width: 50%;
  display: flex;
}
.user-validity {
  width: 50%;
  display: flex;
  justify-content: end;
}
.user-validity-text span {
  font-size: calc(10px + 10px);
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.user-validity span {
  color: rgba(0, 102, 255, 0.8);
  font-size: calc(10px + 10px);
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.add-validity-container {
  margin-top: 20px;
}

.add-validity-container span {
  font-size: calc(10px + 10px);
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.gift-code-container {
  margin-top: 20px;
}

.gift-code-container span {
  font-size: calc(10px + 10px);
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
</style>

<style>
.bio-input .counter {
  white-space: pre-wrap !important;
  padding-inline-start: 0px !important;
}
.en .input-bottom {
  text-align: left;
}
.fa .input-bottom {
  text-align: right;
}
.text-align-left input {
  direction: ltr !important;
}
.text-align-right input {
  direction: rtl !important;
}
</style>
