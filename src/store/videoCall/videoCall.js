import { defineStore } from 'pinia';
import {
  videoCallState,
  startCalling,
  makeVideoCall,
} from '@/api/video-call/index.js';
import { useUserStore } from '@/store/user/user';
import { useGroupChat } from '@/store/chats/groupChat.js';
import { triggerRingtoneAudio } from '@/store/call/call.js';

export const useVideoCallStore = defineStore('VideoCallStore', {
  state: () => ({
    showVideoCallModal: false,
    callerInformation: {},
  }),
  getters: {},
  actions: {
    gettingVideoCall(callerData) {
      const userStore = useUserStore();
      const { userId } = userStore;
      const { data } = callerData;

      const callerUUID = data['caller-uuid'];
      const isOutgoingCall = userId === callerUUID;
      if (!isOutgoingCall) {
        this.showVideoCallModal = true;
        this.callerInformation = {
          name: data['caller-nickname'],
          chatId: data['conference-id'],
        };
        triggerRingtoneAudio(true);
        setTimeout(() => {
          this.showVideoCallModal = false;
        }, 30000);
      }
    },
    async makeConferenceInOTO(userId) {
      const userStore = useUserStore();
      const { token, sessionToken } = userStore;
      const isBusy = await videoCallState(userId);
      if (!isBusy) {
        await startCalling(userId, token);
        makeVideoCall(userId, token, sessionToken);
      }
    },
    async makeConferenceInGroup() {
      const userStore = useUserStore();
      const groupChat = useGroupChat();
      const { token, sessionToken } = userStore;
      const groupId = groupChat.currentGroup.group_id;
      const isBusy = await videoCallState(groupId);
      if (isBusy) {
        makeVideoCall(groupId, token, sessionToken);
        groupChat.currentGroup.activeCall = true;
      } else {
        await startCalling(groupId, token);
        makeVideoCall(groupId, token, sessionToken);
        groupChat.currentGroup.activeCall = true;
      }
    },
    answeredVideoCall(audio, video) {
      const userStore = useUserStore();
      const { token, sessionToken } = userStore;
      makeVideoCall(
        this.callerInformation.chatId,
        token,
        sessionToken,
        audio.value,
        video.value,
      );
      this.closeVideoCallModal();
    },
    closeVideoCallModal() {
      triggerRingtoneAudio(false);
      this.showVideoCallModal = false;
      this.callerInformation = {};
    },
  },
  persist: false,
});
