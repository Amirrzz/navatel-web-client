import { defineStore } from 'pinia';

export const useLocaleStore = defineStore('useLocaleStore', {
  state: () => ({
    locale: null, // fa,en
    userSelected: null,
  }),
  getters: {
    getLocaleFormat(state) {
      return state.userSelected || (state.locale === 'en' ? 'en-US' : 'fa-IR');
    },
    langIsFa(state) {
      return state.locale === 'en';
    },
  },
  persist: true,
});
