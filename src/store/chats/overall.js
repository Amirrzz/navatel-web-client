import { defineStore } from 'pinia';
import { getChatRoomList } from '@/api/OTO/index.js';
import { prepardGroupData } from '@/helpers/grpParser.js';
import { useUserStore } from '@/store/user/user.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { getGroupTitle } from '@/api/groups/index.js';

import {
  chatListParser,
  orderListHandler,
  generateNewDataModelItemInChatList,
} from '@/helpers/overallChatListParser.js';
import { detectNameForNotifChatList } from '@/helpers/overallChatListParser.js';

export const useOverallChatsStore = defineStore('OverallChatsStore', {
  state: () => ({
    chatsList: [],
    chatsListLoading: false,
    currentChat: '',
    desktopActiveChat: '',
  }),
  getters: {
    getListChats() {
      if (!this.chatsList) return [];
      return this.chatsList;
    },
    getForwardedDataList() {
      const contactStore = useContactsStore();
      let chatList = this.getListChats;
      const savedMessageChatIndex = chatList.findIndex((e) => e.isMySelf);
      if (savedMessageChatIndex != -1) {
        chatList.splice(savedMessageChatIndex, 1);
      }
      const contactsList = contactStore.contacts.navaphoneUsers;
      let prepardList = [];
      if (chatList.length > 0) {
        prepardList[0] = recentMessagesTitle;
        prepardList.push(...chatList);
      }
      if (contactsList.length > 0) {
        prepardList.push(recentMessagesTitleContacts);
        prepardList.push(...contactsList);
      }
      return prepardList;
    },
  },
  actions: {
    async getChatList() {
      if (this.chatsList.length == 0) {
        this.chatsListLoading = true;
      }
      const userStore = useUserStore();
      const concatcStore = useContactsStore();
      const otosData = await getChatRoomList();
      const groupsData = await prepardGroupData(userStore.token);
      const parserResult = await chatListParser(
        {
          serverChatList: groupsData.concat(otosData),
          storageChatList: this.chatsList || [],
          storageNavaUsers: concatcStore.contacts.navaphoneUsers || [],
          storageUnsavedUsers: concatcStore.contacts.unSavedUsers || [],
        },
        userStore.userId,
        userStore.phoneNumber,
      );
      this.chatsList = parserResult.orderedList;
      let unSavedUsers = concatcStore.contacts.unSavedUsers;
      unSavedUsers = unSavedUsers.concat(parserResult.unSavedUsers);
      concatcStore.contacts.unSavedUsers = unSavedUsers;
      this.chatsListLoading = false;
      return true;
    },
    async updateList(rtmData) {
      // return;
      if (rtmData.data.body == 'voipcall' || rtmData.mtype == 'oto.mis') return;
      if (rtmData.mtype == 'oto.cpy' && rtmData.data.mtype == 'oto.mst') {
        const chatId = rtmData.data.to;
        const targetChat = this.chatsList.find((e) => e.chatId == chatId) || {};
        targetChat.badge = 0;
        return;
      }
      if (rtmData.mtype == 'oto.cpy' && rtmData.data.mtype != 'oto.mst') {
        /// here should update chat item by yoursleft data
        const chatId = rtmData.data.to;
        let targetChat = this.chatsList.find((e) => e.chatId == chatId);
        if (!targetChat) {
          const userStore = useUserStore();
          const contactsStore = useContactsStore();
          const concatContacts = contactsStore.contacts.navaphoneUsers.concat(
            contactsStore.contacts.unSavedUsers,
          );
          try {
            targetChat = await generateNewDataModelItemInChatList({
              message: rtmData,
              currentUserId: userStore.userId,
              currentUserPhoneNumber: userStore.phoneNumber,
              navaUsers: concatContacts,
              token: userStore.token,
              sessionToken: userStore.sessionToken,
            });
          } catch (error) {
            console.log('error in 222222222222222', error);
          }
        }
        targetChat.isFromMe = true;
        targetChat.badge = 0;
        targetChat.date = rtmData.data.ts;
        targetChat.lastMessageData = {
          content: rtmData.message,
          type: rtmData.mtype,
          guid: rtmData.data.guid,
        };
        targetChat.lastMessageInfo = rtmData;
        targetChat.lastSeenData = {
          guid: rtmData.data.guid,
          isSeen: false,
        };
        this.chnageChatItemOrderInList(targetChat);

        return;
      }

      if (rtmData.mtype == 'oto.mst') {
        const chatId = rtmData.from;
        const targetChat = this.chatsList.find((e) => e.chatId == chatId);
        if (targetChat && targetChat.lastSeenData) {
          targetChat.lastSeenData.isSeen = true;
        }
        return;
      }
      if (
        ['oto.img', 'oto.txt', 'oto.aud', 'oto.doc', 'oto.vid'].includes(
          rtmData.mtype,
        )
      ) {
        const chatId = rtmData.from;
        let targetChat = this.chatsList.find((e) => e.chatId == chatId);

        if (!targetChat) {
          const userStore = useUserStore();
          const contactsStore = useContactsStore();
          const concatContacts = contactsStore.contacts.navaphoneUsers.concat(
            contactsStore.contacts.unSavedUsers,
          );
          try {
            targetChat = await generateNewDataModelItemInChatList({
              message: rtmData,
              currentUserId: userStore.userId,
              currentUserPhoneNumber: userStore.phoneNumber,
              navaUsers: concatContacts,
              token: userStore.token,
              sessionToken: userStore.sessionToken,
            });
          } catch (error) {}
        }
        targetChat.isFromMe = false;
        targetChat.isMySelf = false;
        targetChat.chatId = chatId;
        if (!targetChat.badge) {
          targetChat.badge = 0;
          targetChat.badge++;
        } else {
          targetChat.badge++;
        }

        targetChat.date = rtmData.data.ts;
        targetChat.lastMessageData = {
          content: rtmData.message,
          type: rtmData.mtype,
          guid: rtmData.data.guid,
        };
        targetChat.lastMessageInfo = rtmData;
        targetChat.lastSeenData = {
          guid: rtmData.data.guid,
          isSeen: false,
        };

        this.chnageChatItemOrderInList(targetChat);
      }
    },

    async chnageChatItemOrderInList(targetChat) {
      let dateString = targetChat.date.toString();
      if (dateString.includes('UTC')) {
        const parts = dateString.split(' ');
        const datePart = parts[0];
        const timePart = parts[1].substring(0, 8);
        const fullDateString = `${datePart}T${timePart}Z`;
        // Create a Date object using the combined date string
        dateString = new Date(fullDateString);
      }
      targetChat.date = dateString.toString();
      targetChat.timestamp = dateString.getTime();
      const indexInChatList = this.chatsList.findIndex(
        (e) => e.chatId == targetChat.chatId,
      );
      if (indexInChatList == 0) return;
      if (indexInChatList == -1) {
        let userInformation = {};
        let information;
        if (targetChat.lastMessageInfo.data.source) {
          userInformation.name = targetChat.lastMessageInfo.data.nickname;
          information = {
            avatarClass: 'avatar-color-' + (Math.floor(Math.random() * 6) + 1),
            name: targetChat.lastMessageInfo.data.nickname,
            isUnSavedUser: true,
            phoneNumber: null,
            synced: true,
          };
        } else {
          const list = JSON.parse(JSON.stringify(this.chatsList));
          list.unshift(targetChat);
          const result = await orderListHandler(list);
          this.chatsList = result;
          return;
        }
      }

      const list = JSON.parse(JSON.stringify(this.chatsList));
      const result = await orderListHandler(list);

      this.chatsList = result;
    },

    async updateListFromGroupData(socketReposnse) {
      if (socketReposnse.mtype == 'grp.del') return;
      if (socketReposnse.mtype == 'grp.cst') return;
      if (socketReposnse.mtype.startsWith('grp')) {
        const targetchat = this.chatsList.find((chat) => {
          return chat.chatId == socketReposnse.to;
        });
        const detectInex = this.chatsList.indexOf(targetchat);
        if (socketReposnse.mtype != 'grp.mst') {
          if (detectInex == 0) {
            let newTime = socketReposnse.data?.ts;
            if (newTime) {
              let parts = newTime.split(' ');
              let datePart = parts[0];
              let timePart = parts[1].substring(0, 8);
              let fullDateString = `${datePart}T${timePart}Z`;
              newTime = new Date(fullDateString);
            }
            if (targetchat.badge == 0) {
              targetchat.badge++;
            } else {
              targetchat.badge++;
            }
            targetchat.lastMessageInfo = socketReposnse;
            switch (socketReposnse.mtype) {
              case 'grp.txt':
                targetchat.lastMessageData.content = socketReposnse.message;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.doc':
                targetchat.lastMessageData.content = 'فایل';
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.aud':
                targetchat.lastMessageData.content = `پیام صوتی`;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.stk':
                targetchat.lastMessageData.content = `استیکر`;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.vid':
                targetchat.lastMessageData.content = `پیام ویدیویی`;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.img':
                targetchat.lastMessageData.content = 'پیام تصویری';
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.txt':
                targetchat.lastMessageData.content = socketReposnse.message;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.add':
                const adminNameAddStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                const userNameAddStatus = await detectNameForNotifChatList(
                  socketReposnse.data.uuid,
                );
                targetchat.lastMessageData.content = `${adminNameAddStatus} اضافه کرد  ${userNameAddStatus}`;
                break;
              case 'grp.rmv':
                const adminNameRemoveStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                const userNameRemoveStatus = await detectNameForNotifChatList(
                  socketReposnse.data.uuid,
                );
                targetchat.lastMessageData.content = `${adminNameRemoveStatus} حذف کرد ${userNameRemoveStatus}`;
                break;
              case 'grp.crt':
                const adnibNameCreateStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                targetchat.lastMessageData.content = `${adnibNameCreateStatus} گروه را ایجاد کرد`;
                break;
              case 'grp.lft':
                const userNameLeftStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                targetchat.lastMessageData.content = `${userNameLeftStatus} گروه را ترک کرد`;
                break;
              case 'grp.cfg.avt':
                const adminNameUpdateAvatarStatus =
                  await detectNameForNotifChatList(socketReposnse.from);
                targetchat.lastMessageData.content = `${adminNameUpdateAvatarStatus} آواتار را آپدیت کرد`;
                break;
              case 'grp.cfg.tit':
                const adminNameUpdateTitleStatus =
                  await detectNameForNotifChatList(socketReposnse.from);
                targetchat.lastMessageData.content = `${adminNameUpdateTitleStatus} نام گروه را تغییر داد`;
                break;
            }
            targetchat.date = newTime?.toString() || '';
            targetchat.timestamp = newTime?.getTime() || '';
            if (socketReposnse.mtype == 'grp.cfg.tit') {
              targetchat.groupData.name = socketReposnse.data.value;
            }
          } else if (detectInex == -1) {
            if (socketReposnse.mtype == 'grp.crt') {
              const newGroupName = await getGroupTitle(socketReposnse.to);
              const newGroupAdmin = await detectNameForNotifChatList(
                socketReposnse.from,
              );
              let newTime = socketReposnse.data?.ts;
              if (newTime) {
                let parts = newTime.split(' ');
                let datePart = parts[0];
                let timePart = parts[1].substring(0, 8);
                let fullDateString = `${datePart}T${timePart}Z`;
                newTime = new Date(fullDateString);
              }
              const newChat = {
                badge: 0,
                chatId: socketReposnse.to,
                date: newTime?.toString() || '',
                timestamp: newTime?.getTime() || '',
                isFromMe: false,
                lastSeenData: {
                  isSeen: false,
                  guid: socketReposnse.data.guid,
                },
                lastMessageData: {
                  content: `${newGroupAdmin} گروه را ایجاد کرد`,
                  type: 'grp.crt',
                },
                lastMessageInfo: {},
                groupData: {
                  avatarClass: 'avatar-color-2',
                  groupId: socketReposnse.to,
                  name: newGroupName.value,
                },
                information: {
                  avatarClass: 'avatar-color-2',
                  name: newGroupName.value,
                },
              };
              setTimeout(async () => {
                this.chatsList.unshift(newChat);
                const list = JSON.parse(JSON.stringify(this.chatsList));
                const result = await orderListHandler(list);
                this.chatsList = result;
              }, 4000);
            }
          } else {
            if (socketReposnse.mtype == 'grp.cfg.tit') {
              targetchat.groupData.name = socketReposnse.data.value;
            }
            let newTime = socketReposnse.data?.ts;
            if (newTime) {
              let parts = newTime.split(' ');
              let datePart = parts[0];
              let timePart = parts[1].substring(0, 8);
              let fullDateString = `${datePart}T${timePart}Z`;
              newTime = new Date(fullDateString);
            }
            if (targetchat.badge == 0) {
              targetchat.badge++;
            } else {
              targetchat.badge++;
            }
            targetchat.lastMessageInfo = socketReposnse;
            switch (socketReposnse.mtype) {
              case 'grp.doc':
                targetchat.lastMessageData.content = 'فایل';
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.aud':
                targetchat.lastMessageData.content = `پیام صوتی`;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.stk':
                targetchat.lastMessageData.content = `استیکر`;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.vid':
                targetchat.lastMessageData.content = `پیام ویدیویی`;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.img':
                targetchat.lastMessageData.content = 'پیام تصویری';
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.txt':
                targetchat.lastMessageData.content = socketReposnse.message;
                targetchat.lastMessageData.type = socketReposnse.mtype;
                break;
              case 'grp.add':
                const adminNameAddStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                const userNameAddStatus = await detectNameForNotifChatList(
                  socketReposnse.data.uuid,
                );
                targetchat.lastMessageData.content = `${adminNameAddStatus} اضافه کرد  ${userNameAddStatus}`;
                break;
              case 'grp.rmv':
                const adminNameRemoveStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                const userNameRemoveStatus = await detectNameForNotifChatList(
                  socketReposnse.data.uuid,
                );
                targetchat.lastMessageData.content = `${adminNameRemoveStatus} حذف کرد ${userNameRemoveStatus}`;
                break;
              case 'grp.crt':
                const adnibNameCreateStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                targetchat.lastMessageData.content = `${adnibNameCreateStatus} گروه را ایجاد کرد`;
                break;
              case 'grp.lft':
                const userNameLeftStatus = await detectNameForNotifChatList(
                  socketReposnse.from,
                );
                targetchat.lastMessageData.content = `${userNameLeftStatus} گروه را ترک کرد`;
                break;
              case 'grp.cfg.avt':
                const adminNameUpdateAvatarStatus =
                  await detectNameForNotifChatList(socketReposnse.from);
                targetchat.lastMessageData.content = `${adminNameUpdateAvatarStatus} آواتار را آپدیت کرد`;
                break;
              case 'grp.cfg.tit':
                const adminNameUpdateTitleStatus =
                  await detectNameForNotifChatList(socketReposnse.from);
                targetchat.lastMessageData.content = `${adminNameUpdateTitleStatus} نام گروه را تغییر داد`;
                break;
            }
            targetchat.date = newTime?.toString() || '' || '';
            targetchat.timestamp = newTime?.getTime() || '';
            const list = JSON.parse(JSON.stringify(this.chatsList));
            const result = await orderListHandler(list);
            this.chatsList = result;
          }
        }
      }
    },

    setCurrentChatId(id) {
      this.currentChat = id;
    },

    updateGroupChatRoomBadge(groupId) {
      const targetchat = this.chatsList.find((chat) => {
        return chat.chatId == groupId;
      });
      if (targetchat.badge) {
        targetchat.badge = 0;
      }
    },

  },

  persist: [
    {
      paths: ['chatsList', 'desktopActiveChat'],
    },
  ],
});

const recentMessagesTitleProxy = {
  category: 'recentMessages',
  id: 'recentMessages',
};
const handler = {
  get: function (target, prop) {
    return target[prop];
  },
  set: function (target, prop, value) {
    target[prop] = value;
  },
};
const recentMessagesTitle = new Proxy(recentMessagesTitleProxy, handler);

const recentMessagesContactsProxy = {
  category: 'recentMessagesContacts',
  id: 'recentMessagesContacts',
};
const recentMessagesTitleContacts = new Proxy(
  recentMessagesContactsProxy,
  handler,
);
