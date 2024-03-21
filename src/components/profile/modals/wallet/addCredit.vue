<style scoped>
.light-mode-bg {
  background-color: #ecf0f8;
}
.dark-mode-bg {
  background-color: #000;
}
.add-validity-container {
  width: 100%;
  height: 100dvh;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  display: flex;
  justify-content: center;
  align-items: end;
  overflow: hidden;
}

.validity-mnodal {
  width: 100%;
  height: 54vh;
  margin-bottom: 0px;
  animation: 0.2s open-animation;
  border-radius: 10px 10px 0 0;
}

@keyframes open-animation {
  0% {
    margin-bottom: -400px;
  }
  100% {
    margin-bottom: 0;
  }
}
.title {
  font-size: calc(10px + 10px);
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.button {
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: #f9fbfd;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  color: rgba(0, 102, 255, 0.8);
  font-size: 15px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding: 10px 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  direction: ltr;
}

.total-validaty {
  color: rgba(0, 102, 255, 0.8);
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  width: 200px;
  display: flex;
  justify-content: center;
}

.minze {
  width: 15px;
  height: 2px;
  background: #979191;
}

.submit-button {
  width: 285px;
  height: 41px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: #fff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  color: #000;
  font-size: 16px;
  font-weight: 700;
  line-height: 25px;
  letter-spacing: 0em;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<template>
  <div class="add-validity-container">
    <div
      class="validity-mnodal"
      :class="{
        'dark-mode-bg': getCurrentThemeIsDark,
        'light-mode-bg': !getCurrentThemeIsDark,
      }"
    >
      <ion-row style="padding: 20px 15px">
        <ion-col class="ion-text-start">
          <ion-icon icon="Images/tabs/close.svg" @click="close"> </ion-icon>
        </ion-col>
        <ion-col class="ion-text-end">
          <span class="title">
            {{ $t('tabs.profile.wallet.onlinedeposit') }}
          </span>
        </ion-col>
      </ion-row>

      <ion-row style="padding: 0 5px">
        <ion-col>
          <div class="button" @click="constansUpdateCredit(20_000)">
            {{ $t('tabs.profile.wallet.toman') }} 20000
          </div>
        </ion-col>
        <ion-col>
          <div class="button" @click="constansUpdateCredit(50_000)">
            {{ $t('tabs.profile.wallet.toman') }} 50000
          </div>
        </ion-col>
        <ion-col>
          <div class="button" @click="constansUpdateCredit(80_000)">
            {{ $t('tabs.profile.wallet.toman') }} 80000
          </div>
        </ion-col>
      </ion-row>

      <ion-row style="margin-top: 50px">
        <ion-col class="ion-text-center">
          <div
            style="display: flex; justify-content: end; padding: 0 5px"
            @click="decrementCredit"
          >
            <p class="minze"></p>
          </div>
        </ion-col>
        <ion-col>
          <div class="total-validaty" dir="rtl">
            {{ clientCridet }} {{ $t('tabs.profile.wallet.toman') }}
          </div>
        </ion-col>
        <ion-col class="ion-text-start" @click="incrementCredit">
          <ion-icon style="margin-top: 10px" icon="Images/tabs/plus.svg">
          </ion-icon>
        </ion-col>
      </ion-row>

      <div style="margin-top: 40px; display: flex; justify-content: center">
        <button
          class="submit-button"
          :disabled="clientCridet === 0"
          @click="addPeyment"
        >
          {{ $t('tabs.profile.wallet.depoist') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/store/theme.js';
import { IonCol, IonRow, IonIcon } from '@ionic/vue';
import { useWalletStore } from '@/store/wallet/wallet.js';
import { computed } from 'vue';

const themeStore = useThemeStore();
const walletStore = useWalletStore();

const getCurrentThemeIsDark = computed(() => {
  return themeStore.getThemeIsDark;
});

const clientCridet = computed(() => {
  return walletStore.ClientCredit;
});

const incrementCredit = () => {
  walletStore.incrementCredit(1000);
};

const decrementCredit = () => {
  walletStore.decrementCredit(1000);
};

const constansUpdateCredit = (param) => {
  walletStore.constansUpdateCredit(param);
};

const addPeyment = () => {
  walletStore.addPeyment(clientCridet.value);
};

const close = () => {
  walletStore.resetClientCredit();
  walletStore.updateAddCreditModalStatus(false);
};
</script>
