import { defineStore } from 'pinia';
import { useUserStore } from '@/store/user/user.js';
import { generateUid } from '@/utils/generateUid.js';
import {
  sendTextMessage,
  sendVoiceMessage,
  sendFile,
  sendSticker,
} from '@/api/groups/index.js';
import { fileUploader } from '@/api/file/index.js';
import { useGroupChat } from './groupChat';

export const useChatInput = defineStore('chatInput', {
  state: () => ({
    targetImageFile: null,
    imageFileId: '',
    chatInputValue: '',
    sendMessageFlag: 'send',
    messageSenderInformation: {},
    lastMessageSentId: null,
  }),

  actions: {
    updateLastMessageSentId(param) {
      this.lastMessageSentId = param;
    },

    updateTargetImageFile(param) {
      this.targetImageFile = param;
    },

    clearChatInputValue() {
      this.chatInputValue = '';
    },

    updateMessageSenderInformation(param) {
      this.messageSenderInformation = param;
    },

    clearMessageSenderInformation() {
      this.messageSenderInformation = {};
    },

    handleUpdateSendMessageFlag(param) {
      this.sendMessageFlag = param;
    },

    handleUpdateChatInputValue(param) {
      this.chatInputValue = param;
    },

    async handleSendSticker(param, id) {
      const groupChatstore = useGroupChat();
      const userStore = useUserStore();
      const obj = {
        groupId: groupChatstore.currentGroup.group_id,
        title: groupChatstore.currentGroup.title,
        id: id,
        data: {
          fileId: param.fileId,
          nickname: userStore.nickname,
        },
      };
      await sendSticker(obj);
    },

    async handleSendFile(param) {
      const userStore = useUserStore();
      const groupChatstore = useGroupChat();
      const uploadingFile = await fileUploader(param);
      const obj = {
        mtype: 'grp.doc',
        groupId: groupChatstore.currentGroup.group_id,
        id: generateUid(50),
        title: groupChatstore.currentGroup.title,
        message: '',
        data: {
          description: '',
          fileId: uploadingFile,
          nickname: userStore.nickname,
          md5: 'cudFile.md5',
          name: param.name,
          size: param.size,
          type: param.type,
        },
      };
      const clientObj = {
        mtype: obj.mtype,
        from: userStore.userId,
        id: obj.id,
        firstChar: userStore.nickname.slice(0, 1).toUpperCase(),
        loading: true,
        body: {
          mtype: 'grp.doc',
          edit_state: 0,
          data: { name: param.name, size: param.size, ext_data: {} },
        },
      };
      groupChatstore.updateCurrentGroupMessageInClient(clientObj);
      await sendFile(obj);
    },

    async handleSendVideo(param) {
      const userStore = useUserStore();
      const groupChatstore = useGroupChat();
      const uploadingVideoFile = await fileUploader(param);
      const obj = {
        mtype: 'grp.vid',
        groupId: groupChatstore.currentGroup.group_id,
        id: generateUid(50),
        title: groupChatstore.currentGroup.title,
        message: '',
        data: {
          description: '',
          fileId: uploadingVideoFile,
          nickname: userStore.nickname,
          md5: 'cudFile.md5',
          name: param.name,
          size: param.size,
          type: param.type,
        },
      };
      const clientObj = {
        mtype: obj.mtype,
        from: userStore.userId,
        id: obj.id,
        firstChar: userStore.nickname.slice(0, 1).toUpperCase(),
        loading: true,
        body: {
          mtype: 'grp.vid',
          edit_state: 0,
          data: { name: param.name, size: param.size, ext_data: {} },
        },
      };
      groupChatstore.updateCurrentGroupMessageInClient(clientObj);
      await sendFile(obj);
    },

    async handleSendMessage(param) {
      const userStore = useUserStore();
      let obj = null;
      switch (this.sendMessageFlag) {
        case 'send_image':
          const uploadingImageFile = await fileUploader(this.targetImageFile);
          this.imageFileId = uploadingImageFile;
          obj = {
            mtype: 'grp.img',
            groupId: param.group_id,
            id: param.id,
            title: param.title,
            message: param.message,
            data: {
              fileId: uploadingImageFile,
              nickname: userStore.nickname,
              size: this.targetImageFile.size,
              type: this.targetImageFile.type,
            },
          };
          break;
        case 'edit':
          obj = {
            mtype: param.mtype,
            groupId: param.group_id,
            to: param.to,
            message: param.message,
            title: param.id,
            id: param.id,
            data: {
              editts: param.data.editts,
              guid: param.data.guid,
              mtype: param.data.mtype,
              nickname: param.data.nickname,
            },
          };
          break;
        case 'replay':
          obj = {
            mtype: 'grp.txt',
            groupId: param.group_id,
            message: param.message,
            title: param.title,
            id: param.id,
            data: {
              ext_data: {
                ReplyFromId: param.messageSenderInfo.senderMessageId,
                ReplyFromName: param.messageSenderInfo.messageSenderName,
                replyDescription: param.messageSenderInfo.message,
                replyFileId: param.messageSenderInfo.blob.fileId,
                replyMsgId: param.messageSenderInfo.messageId,
                replyType: 3,
              },
            },
          };
          break;
        case 'send':
          obj = {
            mtype: 'grp.txt',
            groupId: param.group_id,
            message: param.message,
            title: param.title,
            id: param.id,
            guid: '',
            data: {
              ext_data: {
                ReplyFromId: '',
                ReplyFromName: '',
                replyDescription: '',
                replyFileId: '',
                replyMsgId: '',
                replyType: '',
              },
            },
          };
          break;
      }
      await sendTextMessage(obj);
      this.handleUpdateSendMessageFlag('send');
    },

    async handleSendVoice(param, id) {
      const userStore = useUserStore();
      const groupChatstore = useGroupChat();
      const uploadingVoiceFile = await fileUploader(param);
      const result = {
        groupId: groupChatstore.currentGroup.group_id,
        title: groupChatstore.currentGroup.title,
        id: id,
        fileId: uploadingVoiceFile,
        duration: '3000',
        nickname: userStore.nickname,
        size: param.size,
      };
      await sendVoiceMessage(result);
    },
  },
});
