import { defineStore } from 'pinia';

export const useNestedModalsDesktop = defineStore('nestedmodalsdesktop', {
  state: () => ({
    coreModal: false,
    groupChatRoom: false,
    OTOChatRoom: false,
    profile: false,
    removeContact: false,
    contactProfile: false,
    callPad: false,
    callingModalState: true,
    fullScreenCall: true,
    minimizeCallState: false,
    addContact: {
      status: false,
      mode: '',
      data: {
        phoneNumber: '',
      },
    },
    fullScreenImageDesktop: {
      state: false,
      data: {},
    },
  }),

  actions: {
    changeStatusCoreModal(status) {
      this.coreModal = status;
    },
    changeStatusGroupChatRoom(status) {
      this.groupChatRoom = status;
    },
    changeStatusRemoveContact(status) {
      this.removeContact = status;
    },
    changeStatusAddContact(status, mode) {
      this.addContact.status = status;
      this.addContact.mode = mode;
    },
    changeStatusContactProfile(status) {
      this.contactProfile = status;
    },
  },
});
