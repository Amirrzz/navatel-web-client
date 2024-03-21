import { defineStore } from 'pinia';
import { useAuthStore } from '@/store/auth/auth.js';
import { useCallStore } from '@/store/call/call.js';
import { useCdrStore } from '@/store/callHistory/callHistory.js';
// import { useChannelChatStore } from "@/store/chats/channelChat.js";
// import { useGroupChatStore } from "@/store/chats/groupChat.js";
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useRTMStore } from '@/store/rtm/rtm.js';
import { useUserStore } from '@/store/user/user.js';
import { useWalletStore } from '@/store/wallet/wallet.js';
import { deleteDB } from '@/helpers/dbManager';
// rtmStore
export const userReseterStore = defineStore('ReseterStore', {
  actions: {
    resetAllStores() {
      return new Promise((resolve) => {
        const authStore = useAuthStore();
        const cdrStore = useCdrStore();
        //   const channelChatStore = useChannelChatStore();
        //   const groupChatStore = useGroupChatStore();
        const otoStore = useOtoStore();
        const overallChatsStore = useOverallChatsStore();
        const contactsStore = useContactsStore();
        const fileManagerStore = useFileManagerStore();
        const RTMStore = useRTMStore();
        const userStore = useUserStore();
        const walletStore = useWalletStore();
        const callStore = useCallStore();
        authStore.$reset();
        cdrStore.$reset();
        //   channelChatStore.reset();
        //   groupChatStore.reset();
        otoStore.$reset();
        overallChatsStore.$reset();
        contactsStore.$reset();
        fileManagerStore.$reset();
        RTMStore.$reset();
        userStore.$reset();
        walletStore.$reset();
        callStore.$reset();
        deleteDB();
        setTimeout(() => {
          resolve(true);
        }, 0);
      });
    },
    setLengthForSaveInLocalStorage() {
      const contactsStore = useContactsStore();
      contactsStore.contacts = {
        navaphoneUsers: contactsStore.contacts.navaphoneUsers.splice(0, 1000),
        withoutNavaphoneUsers:
          contactsStore.contacts.withoutNavaphoneUsers.splice(0, 1000),
        unSavedUsers: contactsStore.contacts.unSavedUsers.splice(0, 100),
      };
      const overallChatsStore = useOverallChatsStore();
      overallChatsStore.chatsList = overallChatsStore.chatsList.splice(0, 1000);
    },
  },

  persist: false,
});
