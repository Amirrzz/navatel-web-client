import { defineStore } from 'pinia';
import { getFile } from '@/helpers/parser.js';
import { MembersParser } from '@/helpers/parser.js';
import { useOverallChatsStore } from './overall.js';
import { detectRepetitiousGroupMember } from '@/helpers/parser.js';
import { chatsParser } from '@/helpers/otoParser.js';
import { useUserStore } from '@/store/user/user';
import { videoCallState } from '@/api/video-call/index.js';
import { proxyParser } from '@/helpers/parser.js';
import {
  getGroupTitle,
  getGroupAvatar,
  getGroupMembers,
  editTitleGroup,
  updateAvatar,
  addMemberToCurrentGroup,
  removeMemberFromCurrentGroup,
  addAdminRoleToMemberFromCurrentGroup,
  removeAdminRoleToMemberFromCurrentGroup,
  leaveFromCurrentGroup,
  destroyCurrentGroup,
  deleteMessage,
  seenMessage,
  sendTextMessage,
  sendImage,
  sendVideo,
  sendVoiceMessage,
  sendFile,
  forwordMessage,
} from '@/api/groups/index.js';
import {
  loadCurrentGroupMessage,
  loadPreviouslyMessages,
  getFirstMessage,
} from '@/api/groups/groupMessages/index.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { generateUid } from '@/utils/generateUid.js';
import {
  makeDataModelForTextMessage,
  makeDataModelForImage,
  makeDataModelForFile,
  makeDataModelForVideo,
  makeDataModelForVoice,
  makeDataModelForSeen,
} from '@/helpers/grpParser.js';

export const useGroupChat = defineStore('groupChatStore', {
  state: () => ({
    dataFromRtm: [],
    lastCreatedGroup: {},
    memberUidInCurrentGroup: [],
    filterByCurrentGroupMember: [],
    memberForAddToCurrentGroup: [],
    inGroupChatRoom: false,
    inGroupChatRoomDesktop: false,
    getHasPrevMessages: false,
    currentGroup: {
      fristMessageId: '',
      group_id: '',
      title: '',
      avatar: '',
      members: [],
      messages: [],
      activeCall: false,
    },
    loading: false,
    infiniteLoading: false,
    currentGroupMessageLength: 0,
    scrollValue: null,
  }),

  actions: {
    handleReplaceItemForEdit(index, newMessage) {
      this.currentGroup.messages[index] = newMessage;
    },

    updateCurrentGroupMessageLength(param) {
      this.currentGroupMessageLength = param;
    },

    clearCurrentGroup() {
      this.currentGroup.group_id = '';
      this.currentGroup.avatar = '';
      this.currentGroup.title = '';
      this.currentGroup.members = [];
      this.currentGroup.messages = [];
    },

    updateCurrentGroupMessageInClient(param) {
      this.currentGroup.messages.push(param);
    },

    updateInChatRoomStatus(param) {
      this.inGroupChatRoom = param;
    },

    updateDataFromRtm(param) {
      this.dataFromRtm.push(param);
    },

    async filterByCurrentGroupMember() {
      const contactsStore = useContactsStore();
      const navaPhoneConatcts = contactsStore.contacts.navaphoneUsers;
      const currentGroupMembers = this.currentGroup.members;
      const result = await detectRepetitiousGroupMember(
        navaPhoneConatcts,
        currentGroupMembers,
      );
      this.memberForAddToCurrentGroup = result;
    },

    async getGroupTitle(groupId) {
      const result = await getGroupTitle(groupId);
      this.currentGroup.group_id = result.group_id;
      this.currentGroup.title = result.value;
    },

    async getGroupAvatarFileId(groupId) {
      const result = await getGroupAvatar(groupId);
      if (result.value) {
        const fileId = result.value.split('.');
        const fileIdResult = fileId[0] ? fileId[0] : result.value;
        return fileIdResult;
      }
    },

    async getGroupAvatar(groupId) {
      const userStore = useUserStore();
      const result = await getGroupAvatar(groupId);
      if (result.value) {
        if (result.value == 'capture_photo.png') {
          this.currentGroup.avatar = '';
        } else {
          const fileId = result.value.split('.');
          const fileIdResult = fileId[0] ? fileId[0] : result.value;
          const blobFile = await getFile(
            fileIdResult,
            userStore.token,
            'image',
          );
          this.currentGroup.avatar = blobFile.filePath;
        }
      }
    },

    async getGroupMembersUid(groupId) {
      const result = await getGroupMembers(groupId);
      this.memberUidInCurrentGroup = result;
    },

    async addMemberToCurrentGroup() {
      const overallChatsStore = useOverallChatsStore();
      const result = overallChatsStore.groupMembersClient.map((item) => {
        return item.contact_username;
      });
      addMemberToCurrentGroup(this.currentGroup.group_id, result).then(
        async (res) => {
          await this.updateGroupMemberList(this.currentGroup.group_id);
          await this.loadedCurrentGroupMessages(this.currentGroup.group_id, 50);
          overallChatsStore.clearGroupMembersClient();
        },
      );
    },

    async removeMemberFromCurrentGroup(memberID) {
      await removeMemberFromCurrentGroup(this.currentGroup.group_id, memberID);
      await this.updateGroupMemberList(this.currentGroup.group_id);
    },

    async addAdminRoleToMemberFromCurrentGroup(memberID) {
      await addAdminRoleToMemberFromCurrentGroup(
        this.currentGroup.group_id,
        memberID,
      );
      await this.updateGroupMemberList(this.currentGroup.group_id);
    },

    async removeAdminRoleToMemberFromCurrentGroup(memberID) {
      await removeAdminRoleToMemberFromCurrentGroup(
        this.currentGroup.group_id,
        memberID,
      );
      await this.updateGroupMemberList(this.currentGroup.group_id);
    },

    async leaveFromCurrentGroup(role) {
      const overallChatsStore = useOverallChatsStore();
      if (role === 'owner') {
        this.destroyCurrentGroup(this.currentGroup.group_id);
        await leaveFromCurrentGroup(this.currentGroup.group_id);
        await overallChatsStore.getChatList();
      } else {
        await leaveFromCurrentGroup(this.currentGroup.group_id);
        await overallChatsStore.getChatList();
      }
    },

    async destroyCurrentGroup() {
      await destroyCurrentGroup(this.currentGroup.group_id);
    },

    async editTitleGroup(value) {
      await editTitleGroup(this.currentGroup.group_id, value);
      this.getGroupTitle(this.currentGroup.group_id);
      await this.loadedCurrentGroupMessages(this.currentGroup.group_id, 50);
    },

    async updateAvatar(value) {
      await updateAvatar(this.currentGroup.group_id, value);
    },

    async getGroupMembers() {
      const contactsStore = useContactsStore();
      const getNavaPhoneUsers = contactsStore.contacts.navaphoneUsers;
      this.currentGroup.members = await MembersParser(
        getNavaPhoneUsers,
        this.memberUidInCurrentGroup,
      );
    },

    async updateGroupMemberList(groupId) {
      const contactsStore = useContactsStore();
      const getNavaPhoneUsers = contactsStore.contacts.navaphoneUsers;
      await this.getGroupMembersUid(groupId);
      const newList = await MembersParser(
        getNavaPhoneUsers,
        this.memberUidInCurrentGroup,
      );
      const localStorageData = localStorage.getItem('groups');
      const parseLocalStorageData = JSON.parse(localStorageData);
      const currentGroupData = parseLocalStorageData.find((g) => {
        return g.groupId == this.currentGroup.group_id;
      });
      currentGroupData.members = [];
      currentGroupData.members = newList;
      const currentGroupIndex = parseLocalStorageData.indexOf(currentGroupData);
      parseLocalStorageData[currentGroupIndex] = currentGroupData;
      const dataToJosn = JSON.stringify(parseLocalStorageData);
      localStorage.setItem('groups', dataToJosn);
      this.currentGroup.members = newList;
    },

    async loadedCurrentGroupMessages(groupId, count) {
      const userStore = useUserStore();
      const localStorageData = localStorage.getItem('groups');
      const parseLocalStorageData = JSON.parse(localStorageData) || [];
      const currentGroupData = parseLocalStorageData.find((g) => {
        return g.groupId == this.currentGroup.group_id;
      });
      this.loading = true;
      if (!currentGroupData) {
        await this.getGroupMembers();
        const groupData = {
          groupId: this.currentGroup.group_id,
          members: this.currentGroup.members,
        };
        parseLocalStorageData.push(groupData);
        const dataToJosn = JSON.stringify(parseLocalStorageData);
        localStorage.setItem('groups', dataToJosn);
        const groupMembers = proxyParser(this.currentGroup.members);
        const response = await loadCurrentGroupMessage(groupId, count);
        this.currentGroup.messages = await chatsParser(
          response.data.messages,
          userStore.userId,
          null,
          groupMembers,
        );
      } else {
        this.currentGroup.members = currentGroupData.members;
        const groupMembers = proxyParser(this.currentGroup.members);
        const response = await loadCurrentGroupMessage(groupId, count);
        this.currentGroup.messages = await chatsParser(
          response.data.messages,
          userStore.userId,
          null,
          groupMembers,
        );
      }
      this.loading = false;
      setTimeout(() => {
        this.scrollValue.scrollToBottom();
      }, 100);
    },

    async getFirstMessageId() {
      const response = await getFirstMessage(this.currentGroup.group_id, 1);
      this.currentGroup.fristMessageId = response.data.messages[0].guid;
    },

    async loadPreviouslyMessages() {
      const userStore = useUserStore();
      const groupMembers = proxyParser(this.currentGroup.members);
      const lastMessageId = this.currentGroup.messages[0].id;
      if (this.currentGroup.messages[0].type == 'notify.crt') {
        this.getHasPrevMessages = false;
      } else {
        this.getHasPrevMessages = true;
        const response = await loadPreviouslyMessages(
          this.currentGroup.group_id,
          lastMessageId,
          50,
        );
        const result = await chatsParser(
          response.data.messages,
          userStore.userId,
          null,
          groupMembers,
        );
        this.currentGroup.messages.unshift(...result);
        this.scrollValue.scrollToItem(result.length);
        return true;
      }
      return true;
    },

    async editedMessage(param) {
      await editMessage(param);
    },

    async seenedMessage(param) {
      const result = await makeDataModelForSeen(
        param,
        this.currentGroup.group_id,
      );
      await seenMessage(result);
    },

    async checkActiveCall() {
      const groupId = this.currentGroup.group_id;
      const isBusy = await videoCallState(groupId);
      if (isBusy) {
        this.currentGroup.activeCall = true;
      }
    },

    // ************ messages oprotions in group part ************ //

    async forwordedMessage(param) {
      await forwordMessage(param);
    },

    async handleSendMessage(param, data, state) {
      const userStore = useUserStore();
      const targetUser = this.currentGroup.members.find((index) => {
        return index.contact_username == userStore.userId;
      });
      switch (state) {
        case 'text':
          const newMessage = {
            content: param.text,
            id: generateUid(30),
            itsMe: true,
            type: 'text',
            status: 'sending',
            editedInfo: {
              isEdited: false,
              date: '',
            },
            additionalMessageInfo: {
              userInformation: targetUser,
            },
          };
          this.currentGroup.messages.push(newMessage);
          console.log(newMessage, 'newMessage');
          await sendTextMessage(
            makeDataModelForTextMessage(newMessage, data, state),
          );
          break;
        case 'replay':
          const newReplayMessage = {
            content: param.text,
            id: generateUid(30),
            itsMe: true,
            type: 'text',
            status: 'sending',
            editedInfo: {
              isEdited: false,
              date: '',
            },
            additionalMessageInfo: {
              userInformation: targetUser,
            },
          };
          this.currentGroup.messages.push(newReplayMessage);
          await sendTextMessage(
            makeDataModelForTextMessage(newReplayMessage, data, state),
          );
          break;
        case 'image':
          const newImageMessage = {
            content: '',
            itsMe: true,
            type: 'image',
            status: 'sending',
            id: generateUid(30),
            editedInfo: {
              isEdited: false,
              date: '',
            },
            additionalMessageInfo: {
              userInformation: targetUser,
            },
          };
          this.currentGroup.messages.push(newImageMessage);
          const resultImage = await makeDataModelForImage({
            ...newImageMessage,
            ...param,
          });
          await sendImage(resultImage);
          break;
        case 'file':
          const newFileMessage = {
            content: '',
            itsMe: true,
            type: 'file',
            status: 'sending',
            id: generateUid(30),
            editedInfo: {
              isEdited: false,
              date: '',
            },
            additionalMessageInfo: {
              name: param.files[0].name,
              mbSize: param.files[0].size,
              userInformation: targetUser,
            },
          };
          this.currentGroup.messages.push(newFileMessage);
          const resultFile = await makeDataModelForFile({
            ...newFileMessage,
            ...param,
          });
          await sendFile(resultFile);
          break;
        case 'video':
          const newVideoMessage = {
            content: '',
            itsMe: true,
            type: 'video',
            status: 'sending',
            id: generateUid(30),
            editedInfo: {
              isEdited: false,
              date: '',
            },
            additionalMessageInfo: {
              name: param.files[0].name,
              mbSize: param.files[0].size,
              userInformation: targetUser,
            },
          };
          this.currentGroup.messages.push(newVideoMessage);
          const resultVideo = await makeDataModelForVideo({
            ...newVideoMessage,
            ...param,
          });
          await sendVideo(resultVideo);
          break;
        case 'audio':
          const newVoiceMessage = {
            content: '',
            itsMe: true,
            type: 'audio',
            status: 'sending',
            id: generateUid(30),
            editedInfo: {
              isEdited: false,
              date: '',
            },
            additionalMessageInfo: {
              name: param.name,
              mbSize: param.size,
              userInformation: targetUser,
            },
          };
          this.currentGroup.messages.push(newVoiceMessage);
          const resultVoice = await makeDataModelForVoice({
            ...newVoiceMessage,
            file: param,
          });
          await sendVoiceMessage(resultVoice);
          break;
      }
      this.scrollValue.scrollToBottom();
    },

    async deletedMessage(param) {
      await deleteMessage(param).then((res) => {
        this.deleteMessageFromCurrentGroup(param.guid);
      });
    },

    deleteMessageFromCurrentGroup(id) {
      this.currentGroup.messages = this.currentGroup.messages.filter(
        (message) => message.guid != id,
      );
    },

    // ************ messages oprotions in group part ************ //
  },

  persist: {
    paths: ['currentGroup'],
  },
});
