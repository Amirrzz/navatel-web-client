import { defineStore } from 'pinia';

export const useErrorStore = defineStore('useErrorStore', {
  state: () => ({
    errors: [], // fa,en
  }),
  getters: {
    showErrorModal(state) {
      return state.errors && state.errors.length > 0;
    },
  },
  actions: {
    setErrors() {
      this.errors.push({});
    },
    clearErrors() {
      this.errors = [];
    },
  },
  persist: false,
});
