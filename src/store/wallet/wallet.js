import { defineStore } from 'pinia';
import { useUserStore } from '@/store/user/user.js';
import { getBalance, peyment } from '@/api/wallet/index.js';
import { proxyParser } from '@/helpers/parser.js';
export const useWalletStore = defineStore('walletStore', {
  state: () => ({
    userCredit: null,
    ClientCredit: 0,
    addCreditModalStatus: false,
  }),

  actions: {
    updateAddCreditModalStatus(status) {
      this.addCreditModalStatus = status;
    },

    incrementCredit(param) {
      this.ClientCredit += param;
    },

    decrementCredit(param) {
      if (this.ClientCredit > 0) {
        this.ClientCredit -= param;
      }
    },

    constansUpdateCredit(param) {
      this.ClientCredit = param;
    },

    resetClientCredit() {
      this.ClientCredit = 0;
    },

    async getCredit() {
      const userStore = useUserStore();
      const credit = await getBalance(userStore.phoneNumber);
      const result = proxyParser(credit);
      this.userCredit = Math.floor(result.data);
    },

    async addPeyment(amount) {
      const userStore = useUserStore();
      const result = await peyment(userStore.phoneNumber, amount);
      const paymentUrl = result.data.payment_url;
      window.open(paymentUrl + '?' + result.data.payment_id);
    },
  },
});
