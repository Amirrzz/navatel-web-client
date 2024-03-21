import { defineStore } from 'pinia';
import { getUser, getUsers, updateUser } from '@/api/user/index.js';
import { setStatus, getStatus } from '@/api/status/index.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';

export const useUserStore = defineStore('UserStore', {
  state: () => ({
    nickname: null,
    phoneNumber: null,
    token: '',
    avatar: null,
    avatarFileId: null,
    userId: null, // userId == uuid
    flowId: null,
    sessionToken: null,
    locale: null, // fa,en
    bio: null,
    status: null,
    profileImageIsDownloading: null,
    avatarBackColor: null,
  }),
  getters: {
    getFirstChars(state) {
      if (!state.nickname) return '';
      return state.nickname[0] + ' ' + state?.nickname[1];
    },
    getAvatar(state) {
      return state.avatar;
    },
  },
  actions: {
    getCurrentUserProfile(userId = this.userId) {
      return getUser(userId).then(async (result) => {
        this.nickname = result.nickname;
        this.phoneNumber = result.phone_number;
        this.userId = result.uuid;
        this.avatarBackColor =
          this.avatarBackColor ||
          'avatar-color-' + (Math.floor(Math.random() * 6) + 1);
        if (result.avatar) {
          const fileId = result.avatar.split('.');
          const fileIdResult = fileId[0] ? fileId[0] : result.avatar;
          this.avatarFileId = fileIdResult;
          this.profileImageIsDownloading = true;
          const fileManagerStore = useFileManagerStore();
          fileManagerStore.gettingAvatarsHandler(fileIdResult, true);
          fileManagerStore.gettingAvatarsHandler(fileIdResult, false);
        }
        this.getCurrentUserStatus();
        return true;
      });
    },
    getCurrentUserStatus(userId = this.userId) {
      return getStatus(userId).then((result) => {
        this.bio = result.presence;
        this.status = result.status;
      });
    },
    getOtherUserProfile(userIds = []) {
      return getUsers(userIds);
    },
    setUserProfile(data) {
      return updateUser(data);
    },
    setUserStatus(data) {
      return setStatus(data);
    },
    // This Action only called in Auth Store After User logged in
    handelUserInformationProccess(token, userId, sessionToken, flowId) {
      this.token = token;
      this.userId = userId;
      this.sessionToken = sessionToken;
      this.flowId = flowId;
      return this.getCurrentUserProfile(userId).then(() => {
        return true;
      });
    },
    setUserInformation(userId, nickname, phoneNumber) {
      this.nickname = nickname;
      this.phoneNumber = phoneNumber;
      this.userId = userId;
    },

    parseJwtPayload(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const rawPayload = window.atob(base64);
      const utf8Payload = decodeURIComponent(
        Array.prototype.map
          .call(rawPayload, function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );
      const parsedPayload = JSON.parse(utf8Payload);
      return parsedPayload;
    },
  },
  persist: [
    {
      paths: [
        'nickname',
        'phoneNumber',
        'token',
        'avatarFileId',
        'userId',
        'flowId',
        'sessionToken',
        'locale',
        'bio',
        'status',
        'avatarBackColor',
      ],
      storage: localStorage,
    },
  ],
});
