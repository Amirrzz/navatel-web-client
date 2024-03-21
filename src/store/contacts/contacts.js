import { defineStore } from 'pinia';
import {
  getContacts,
  addContact,
  editContact,
  removeContact,
} from '@/api/contacts/index.js';
import { useUserStore } from '@/store/user/user.js';
import { useLocaleStore } from '@/store/locale.js';
import { getUserProfileByPhoneNumber, getUser } from '@/api/user/index.js';
import { sendRequestStatus } from '@/helpers/parser.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';

import {
  contactsParser,
  getUnsavedUsersInformation,
} from '@/helpers/contactsParser.js';
export const useContactsStore = defineStore('ContactsStore', {
  state: () => ({
    addToGroupActive: false,
    contacts: {
      navaphoneUsers: [],
      withoutNavaphoneUsers: [],
      unSavedUsers: [],
    },
    storageContacts: {
      navaphoneUsers: [],
      withoutNavaphoneUsers: [],
      unSavedUsers: [],
    },
    supportInfomation: {
      chatId: 'd50fb85d-3f42-4957-9bf5-ee9421561b22',
      information: {
        name: 'Support',
        phoneNumber: '989317307600',
        synced: true,
        avatarClass: 'avatar-color-2',
      },
      lastMessageData: {
        guid: null,
      },
      lastSeenData: {
        guid: null,
      },
    },
    contactsIsLoading: false,
    userProfilesBeforeContactsResponse: [],
    search: '',
    searchExistInTransformContatcs: '',
    selectedConatct: {},
    contactsListRequested: {},
  }),
  getters: {
    seacrhInBothTypeOfContacts(state) {
      if (!state.search || state.search == '') return state.contacts;
      const navaphoneUsersObject = state.contacts.navaphoneUsers;
      const withoutNavaphoneUsers = state.contacts.withoutNavaphoneUsers;
      const searchValue = state.search.toLowerCase();
      let navaPhoneFiltredUsers = [];
      navaphoneUsersObject.forEach((e) => {
        if (e.category) return;
        const name = e.name.toLowerCase();
        const contactPhone = e.contact_phone.toLowerCase();
        if (name.includes(searchValue) || contactPhone.includes(searchValue)) {
          const category = navaPhoneFiltredUsers.find(
            (i) => i.category == e.firstChar,
          );
          if (!category) {
            const category = navaphoneUsersObject.find(
              (i) => i.category == e.firstChar,
            );
            navaPhoneFiltredUsers.push(category);
          }
          navaPhoneFiltredUsers.push(e);
        }
      });
      let withoutNavaphoneFiltredUsers = withoutNavaphoneUsers.filter((e) => {
        const name = e.name.toLowerCase();
        const contactPhone = e.contact_phone.toLowerCase();
        if (name.includes(searchValue) || contactPhone.includes(searchValue)) {
          return e;
        }
      });
      const result = {
        navaphoneUsers: navaPhoneFiltredUsers,
        withoutNavaphoneUsers: withoutNavaphoneFiltredUsers,
      };
      return result;
    },
    searchInNavaPhoneContactList(state) {
      if (
        !state.searchExistInTransformContatcs ||
        state.searchExistInTransformContatcs == ''
      )
        return state.contacts.navaphoneUsers.filter((e) => !e.category);
      const navaphoneUsersObject = state.contacts.navaphoneUsers;
      const searchExistInTransformContatcsValue =
        state.searchExistInTransformContatcs.toLowerCase();
      const list = navaphoneUsersObject.filter((e) => {
        if (e.category) return;
        const name = e.name.toLowerCase();
        const contactPhone = e.contact_phone.toLowerCase();
        if (
          name.includes(searchExistInTransformContatcsValue) ||
          contactPhone.includes(searchExistInTransformContatcsValue)
        ) {
          return e;
        }
      });
      return list;
    },
    searchNavaPhoneUserForAddingToChat(state) {
      if (!state.navaPhoneUserFromChat || state.navaPhoneUserFromChat == '')
        return state.contacts.navaphoneUsers.filter((e) => !e.category);
      const navaphoneUsersObject = state.contacts.navaphoneUsers;
      const searchExistInTransformContatcsValue =
        state.navaPhoneUserFromChat.toLowerCase();
      const list = navaphoneUsersObject.filter((e) => {
        if (e.category) return;
        const name = e.name.toLowerCase();
        const contactPhone = e.contact_phone.toLowerCase();
        if (
          name.includes(searchExistInTransformContatcsValue) ||
          contactPhone.includes(searchExistInTransformContatcsValue)
        ) {
          return e;
        }
      });
      return list;
    },
    getListContacts() {
      const filtredList = this.seacrhInBothTypeOfContacts;
      const navaphoneUsers = filtredList.navaphoneUsers;
      const withoutNavaphoneUsers = filtredList.withoutNavaphoneUsers;
      if (withoutNavaphoneUsers.length > 0) {
        // need to be a proxy object for rendering in contacts list
        // if it not makes trouble
        // proxy is
        const inviteContatcsTitleObject = navaphoneUsers.find(
          (e) => e.category == 'inviteContatcsTitle',
        );
        if (!inviteContatcsTitleObject) {
          navaphoneUsers.push(withoutAccountTitleObject);
        }
        const list = navaphoneUsers.concat(withoutNavaphoneUsers);
        return list;
      }
      return navaphoneUsers;
    },
    getListContactsForMessages() {
      const navaphoneUsers = this.contacts.navaphoneUsers;
      return navaphoneUsers;
    },
  },
  actions: {
    updateSelectedConatct(param) {
      this.selectedConatct = param;
    },
    getContactsList() {
      this.contactsIsLoading = true;
      const userStore = useUserStore();
      const storageContacts = JSON.parse(JSON.stringify(this.contacts));
      return getContacts(userStore.userId).then(async (result) => {
        const parsedResult = await contactsParser(result, storageContacts);
        this.contacts.navaphoneUsers = parsedResult.navaphoneUsers;
        this.contacts.withoutNavaphoneUsers =
          parsedResult.withoutNavaphoneUsers;
        this.contactsIsLoading = false;
        return true;
      });
    },
    getUserProfileHandler(targetUser, isThumbnail) {
      /// check targetUser is uuid or number
      // here if targetUser not equal a userId its mean targetUser is phoneNumber
      const user = this.contactsListRequested[targetUser];
      if (user) {
        return user;
      }
      if (!/^[a-z,0-9,-]{36,36}$/.test(targetUser)) {
        // get uuid of a user by phoneNumber then get user profile data by uuid
        // this function handel this senario, apis exist in user Api file
        return this.getUserProfileByNumber(targetUser).then(
          (userInformation) => {
            // if contactsIsLoading be true push user infromation to a temp
            if (this.contactsIsLoading) {
              this.userProfilesBeforeContactsResponse.push(userInformation);
              this.contactsListRequested[targetUser] = userInformation;
              return userInformation;
            }
            // try to find index in contacts list userInformation.uuid
            const userIndexInContactsList =
              this.contacts.navaphoneUsers.findIndex(
                (e) => e.contact_username == userInformation.uuid,
              );
            // try to find index in temp list depond on userInformation.uuid
            const tempUsersProfile = this.userProfilesBeforeContactsResponse;
            const userIndexInTempList = tempUsersProfile.findIndex(
              (e) => e?.uuid == userInformation.uuid,
            );
            if (userInformation.avatar) {
              const fileId = userInformation.avatar.split('.');
              const fileIdResult = fileId[0]
                ? fileId[0]
                : userInformation.avatar;
              const fileManagerStore = useFileManagerStore();
              fileManagerStore.gettingAvatarsHandler(fileIdResult, isThumbnail);
              if (userIndexInContactsList == -1) {
                userInformation.avatarFileId = fileIdResult;
                if (userInformation)
                  this.contacts.unSavedUsers.push(userInformation);
                this.contactsListRequested[targetUser] = userInformation;
                return userInformation;
              } else {
                const contact =
                  this.contacts.navaphoneUsers[userIndexInContactsList];
                contact['avatarFileId'] = fileIdResult;
                userInformation.nickname = contact.name;
                userInformation.avatarFileId = fileIdResult;
                this.contactsListRequested[targetUser] = userInformation;
                return userInformation;
              }
            }
            // detect user should be in unSavedUser list or not
            if (userIndexInContactsList == -1) {
              const findIndexUnsavedUser = this.contacts.unSavedUsers.findIndex(
                (e) => e?.uuid == userInformation.uuid,
              );
              if (findIndexUnsavedUser == -1) {
                if (userInformation)
                  this.contacts.unSavedUsers.push(userInformation);
              }
            } else {
              const contact =
                this.contacts.navaphoneUsers[userIndexInContactsList];
              userInformation.nickname = contact.name;
            }
            if (userIndexInTempList != -1) {
              // means exist on temp
              tempUsersProfile.splice(userIndexInTempList, 1);
            }
            this.contactsListRequested[targetUser] = userInformation;
            return userInformation;
          },
        );
      }
      ////
      return this.getContactInformation(targetUser).then(
        async (userInformation) => {
          if (this.contactsIsLoading) {
            this.userProfilesBeforeContactsResponse.push(userInformation);
            this.contactsListRequested[targetUser] = userInformation;
            return userInformation;
          }
          // try to find index in contacts list userInformation.uuid
          const userIndexInContactsList =
            this.contacts.navaphoneUsers.findIndex(
              (e) => e.contact_username == userInformation.uuid,
            );
          // try to find index in temp list depond on userInformation.uuid
          const tempUsersProfile = this.userProfilesBeforeContactsResponse;
          const userIndexInTempList = tempUsersProfile.findIndex(
            (e) => e?.uuid == userInformation.uuid,
          );
          // detect user should be in unSavedUser list or not

          if (userInformation.avatar) {
            const fileId = userInformation.avatar.split('.');
            const fileIdResult = fileId[0] ? fileId[0] : userInformation.avatar;
            const fileManagerStore = useFileManagerStore();
            fileManagerStore.gettingAvatarsHandler(fileIdResult, isThumbnail);
            if (userIndexInContactsList == -1) {
              userInformation.avatarFileId = fileIdResult;
              if (userInformation)
                this.contacts.unSavedUsers.push(userInformation);
              this.contactsListRequested[targetUser] = userInformation;
              return userInformation;
            } else {
              const contact =
                this.contacts.navaphoneUsers[userIndexInContactsList];
              contact['avatarFileId'] = fileIdResult;
              userInformation.nickname = contact.name;
              userInformation.avatarFileId = fileIdResult;
              this.contactsListRequested[targetUser] = userInformation;
              return userInformation;
            }
          }
          if (userIndexInContactsList == -1) {
            const findIndexUnsavedUser = this.contacts.unSavedUsers.findIndex(
              (e) => e?.uuid == userInformation.uuid,
            );
            if (findIndexUnsavedUser == -1) {
              if (userInformation)
                this.contacts.unSavedUsers.push(userInformation);
            }
          } else {
            const contact =
              this.contacts.navaphoneUsers[userIndexInContactsList];
            userInformation.nickname = contact.name;
          }
          if (userIndexInTempList != -1) {
            // means exist on temp
            tempUsersProfile.splice(userIndexInTempList, 1);
          }
          this.contactsListRequested[targetUser] = userInformation;
          return userInformation;
        },
      );
    },
    async getUserOnlineStatus(userId) {
      const userStore = useUserStore();
      const localeStore = useLocaleStore();
      const localeFormat = localeStore.getLocaleFormat;

      const status = await sendRequestStatus(
        userId,
        userStore.token,
        localeFormat,
      );
      return status;
    },
    async getContactInformation(userId) {
      return await getUser(userId);
    },

    getUserProfile(userId, type, isThumbnail) {
      return this.getContactInformation(userId).then(async (result) => {
        const userIndex = this.contacts.navaphoneUsers.findIndex(
          (e) => e.contact_username == userId,
        );

        if (userIndex == -1) return;
        if (result.avatar) {
          const fileId = result.avatar.split('.');
          const fileIdResult = fileId[0] ? fileId[0] : result.avatar;
          const fileManagerStore = useFileManagerStore();
          fileManagerStore.gettingAvatarsHandler(fileIdResult, isThumbnail);
          this.contacts.navaphoneUsers[userIndex]['avatarFileId'] =
            fileIdResult;
          const overallStore = useOverallChatsStore();
          let chatItem = overallStore.chatsList.find(
            (item) => item.chatId == userId,
          );
          if (chatItem) {
            chatItem.information.avatarFileId = fileIdResult;
          }
        }
        this.contacts.navaphoneUsers[userIndex]['nickname'] = result.nickname;
        return this.contacts.navaphoneUsers[userIndex];
      });
    },

    getUnSavedConatactProfile(userId, type, isThumbnail) {
      const userIndex = this.contacts.unSavedUsers.findIndex(
        (e) => e.uuid == userId,
      );
      return this.getContactInformation(userId).then(async (result) => {
        if (result.avatar) {
          const fileId = result.avatar.split('.');
          const fileIdResult = fileId[0] ? fileId[0] : result.avatar;
          const fileManagerStore = useFileManagerStore();
          fileManagerStore.handlerForGettingFile(
            fileIdResult,
            type,
            isThumbnail,
            userId,
          );
        }
        if (userIndex != -1) {
          this.contacts.unSavedUsers[userIndex] = result;
        }
        if (result) this.contacts.unSavedUsers.push(result);
      });
    },
    getUserInNavaphoneContacts(seacrhValue) {
      const navaphoneUsers = this.contacts.navaphoneUsers;
      const user = navaphoneUsers.find(
        (e) =>
          e.contact_phone == seacrhValue ||
          e.contact_username == seacrhValue ||
          e.nickname == seacrhValue ||
          e.name == seacrhValue,
      );
      return user;
    },
    getUserInWithoutNavaPhoneUsers(seacrhValue) {
      const user = this.contacts.withoutNavaphoneUsers.find(
        (e) => e.contact_phone === seacrhValue || e.name === seacrhValue,
      );
      return user;
    },
    getUserInAllContacts(seacrhValue) {
      const navaphoneUser = this.getUserInNavaphoneContacts(seacrhValue);
      if (navaphoneUser) return navaphoneUser;
      return this.getUserInWithoutNavaPhoneUsers(seacrhValue);
    },
    getUserByPhoneAndUserId(searchValue) {
      const navaphoneUsers = this.contacts.navaphoneUsers;
      const user = navaphoneUsers.find(
        (e) =>
          e.contact_phone === searchValue || e.contact_username === searchValue,
      );
      if (user) {
        const userExistInUpdateProfileList = this.contactsProfileList.find(
          (e) => e.userId == user.contact_username,
        );
        if (userExistInUpdateProfileList) {
          return Promise.resolve({
            ...user,
            ...userExistInUpdateProfileList,
          });
        } else {
          return this.getContactInformation(user.contact_username);
        }
      }
      const withoutNavaphoneUsers = this.contacts.withoutNavaphoneUsers;
      const userWithoutNavaphone = withoutNavaphoneUsers.find(
        (e) => e.contact_phone === searchValue,
      );

      if (userWithoutNavaphone) return Promise.resolve(userWithoutNavaphone);
      if (/^[a-z,0-9,-]{36,36}$/.test(searchValue)) {
        return this.getContactInformation(searchValue);
      }
      return this.getUserProfileByNumber(searchValue);
    },
    getUserProfileByNumber(phoneNumber) {
      return getUserProfileByPhoneNumber(phoneNumber);
    },

    addContact(data) {
      const userStore = useUserStore();
      const userId = userStore.userId;
      const contactsData = {
        ...data,
        userId: userId,
      };
      return addContact(contactsData).then(() => {
        return true;
      });
    },

    editContact(data) {
      const userStore = useUserStore();
      const userId = userStore.userId;
      const contactsData = {
        ...data,
        userId: userId,
      };
      return editContact(contactsData).then(() => {
        return true;
      });
    },

    async removeContact(data) {
      const userStore = useUserStore();
      const userId = userStore.userId;
      const contactsData = {
        ...data,
        userId: userId,
      };
      await removeContact(contactsData);
    },

    getUnsavedUserInformationFromWorker(targetId) {
      const userStore = useUserStore();
      return getUnsavedUsersInformation(
        targetId,
        userStore.token,
        userStore.sessionToken,
      );
    },
    updateUnsavedUsersList(data) {
      const userIndex = this.contacts.unSavedUsers.findIndex(
        (e) => e.uuid == data.uuid,
      );
      if (userIndex != -1) {
        this.contacts.unSavedUsers[userIndex] = data;
        return;
      }
      if (data) this.contacts.unSavedUsers.push(data);
    },
  },
  persist: [
    {
      paths: ['contacts', 'supportInfomation'],
    },
  ],
});
const target = {
  category: 'inviteContatcsTitle',
  id: 'inviteContatcsTitle',
};
const handler = {
  get: function (target, prop) {
    return target[prop];
  },
  set: function (target, prop, value) {
    target[prop] = value;
  },
};
const withoutAccountTitleObject = new Proxy(target, handler);
