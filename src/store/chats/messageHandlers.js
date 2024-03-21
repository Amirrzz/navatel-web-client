import { defineStore } from 'pinia';

export const useMessangerHanlder = defineStore('MessangerHanlder', {
  state: () => ({}),
  getters: {},
  actions: {
    getMessageHandler({
      chatId = null,
      lastSeenMessageId = null,
      lastMessageId = null,
      count = 50,
      source,
    }) {
      if (!lastSeenMessageId && !lastMessageId) {
        /// its new user
        // To ensure get 50 first message
        return {
          target: 'getFirstMessages',
          arguments: {
            chatId,
            count,
          },
        };
      }
      if (lastSeenMessageId == lastMessageId) {
        return {
          target: 'getPrevMessages',
          arguments: {
            chatId,
            targetMessageId: lastMessageId,
            count,
            source,
          },
        };
      }
      if (lastSeenMessageId == lastMessageId) {
        return {
          target: 'getNextAndPrevMessages',
          arguments: {
            chatId,
            targetMessageId: lastSeenMessageId,
            count,
            source,
          },
        };
      }
    },
  },
  persist: false,
});
