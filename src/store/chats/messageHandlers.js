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
      isFirstRequest,
    }) {
      if (!lastSeenMessageId && !lastMessageId) {
        /// its new user
        // To ensure get 50 first message
        return {
          target: 'getFirstMessages',
          arguments: {
            chatId,
            count,
            isFirstRequest,
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
            isFirstRequest,
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
            isFirstRequest,
          },
        };
      }
    },
  },
  persist: false,
});
