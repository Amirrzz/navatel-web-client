import { defineStore } from 'pinia';
import { registerUserByPhone, confirmOtpCode } from '@/api/auth/index.js';
import { useUserStore } from '@/store/user/user.js';
import { getDataFromIp } from '@/api/geoData/index.js';

export const useAuthStore = defineStore('AuthStore', {
  state: () => ({
    flowId: null,
    uuid: null,
    isLoading: null,
    isLoggedIn: null,
    geoData: null,
    prefix: null,
    phoneNumber: null,
    phoneFullNumber: null,
    selectedLanguage: null,
    calendar: null, // jalali,miladi
  }),
  getters: {
    defaultCountryCode(state) {
      return (state.geoData?.location.country?.calling_code || 98).toString();
    },
  },
  actions: {
    getIpData() {
      getDataFromIp().then((result) => {
        this.geoData = result;
      });
    },
    register(phoneFullNumber) {
      // Include Register Proccess
      this.isLoading = true;
      return registerUserByPhone(phoneFullNumber).then((result) => {
        this.flowId = result.flowId;
        this.uuid = result.uuid;
        this.phoneFullNumber = phoneFullNumber;
        this.isLoading = false;
        return true;
      });
    },
    //
    resendConfirmCode() {
      // Include Register Proccess
      this.isLoading = true;
      return registerUserByPhone(this.phoneFullNumber).then((result) => {
        this.flowId = result.flowId;
        this.uuid = result.uuid;
        this.isLoading = false;
        return true;
      });
    },
    // Include login Proccess
    login(confirmationCode) {
      // Confirmation Phone number by Code
      this.isLoading = true;
      const flowId = this.flowId;
      return confirmOtpCode(
        confirmationCode,
        this.phoneFullNumber,
        flowId,
      ).then((result) => {
        this.isLoggedIn = true;
        const userStore = useUserStore();
        return userStore
          .handelUserInformationProccess(
            result.jwt,
            result.uuid,
            result.session_token,
            this.flowId,
          )
          .then(() => {
            // Here getUser Action in UserStore is Happend
            this.isLoading = false;
            // state this store now is not use in anywhere they should be assigned to null\
            // exclude isLoggedIn that use in router for authorization
            return true;
          });
      });
    },
    // Include logout Proccess
    logout() {
      this.isLoggedIn = null;
    },
  },
  persist: true,
});
