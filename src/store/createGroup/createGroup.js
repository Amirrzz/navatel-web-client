import { defineStore } from 'pinia';
import { createGroup } from '@/api/groups/index';
import { fileUploader } from '@/api/file/index.js';
import { getFile } from '@/helpers/parser.js';
import { useUserStore } from '@/store/user/user';
import { useGroupChat } from '@/store/chats/groupChat';

export const useCreateGroup = defineStore('createGroup', {
  state: () => ({
    createGroupActiveFlag: false,
    addNameActiveFlag: false,
    membersList: [],
    groupName: '',
    avatar: '',
    avatarBlob: '',
  }),

  actions: {
    resetState() {
      this.createGroupActiveFlag = false;
      this.addNameActiveFlag = false;
      this.membersList = [];
      this.groupName = '';
      this.avatar = '';
      this.avatarBlob = '';
    },

    async creatingGroup() {
      const result = this.membersList.map((member) => member.contact_username);
      const groupInformation = {
        title: this.groupName,
        members: result,
        avatar: this.avatar,
      };
      await createGroup(groupInformation).then(async (response) => {
        this.resetState();
        const groupChatStore = useGroupChat();
        groupChatStore.currentGroup.group_id = response.group_id;
      });
    },

    addMemberToGroup(member) {
      const list = this.membersList
        .map((item) => item.contact_username)
        .includes(member.contact_username);
      if (!list) {
        this.membersList.push(member);
      } else {
        this.membersList = this.membersList.filter(
          (item) => item.contact_username != member.contact_username,
        );
      }
    },

    async uploadingAvatar(param) {
      const userStore = useUserStore();
      const fileId = await fileUploader(param.files[0]);
      this.avatar = fileId;
      const blobAvatar = await getFile(fileId, userStore.token, 'image');
      this.avatarBlob = blobAvatar.filePath;
    },
  },
});
