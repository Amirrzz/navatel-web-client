import { useWebWorkerFn } from '@vueuse/core';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useUserStore } from '@/store/user/user.js';
import { detectTextDirection } from '@/helpers/textFormatter.js';
import { convertUtcToSupportedDate } from '@/helpers/dateAndTimeFormatter.js';
export const filterChatListParser = async ({
  serverChatList,
  storageChatList,
  storageContacts,
}) => {
  const { workerFn } = useWebWorkerFn(
    (serverChatList, storageChatList, storageContacts) => {
      const validListItem = _.filter(serverChatList, (item) => {
        return (
          Boolean(item.from) && Boolean(item.to) && Boolean(item.creation_time)
        );
      });
      let navaUsers = [];
      _.filter(storageContacts, (account) => {
        if (account && account.category == null) {
          navaUsers.push({
            contact_username: account.contact_username || account.uuid,
            avatarClass: account.avatarClass,
            name: account.name || account.nickname,
            phoneNumber: account.contact_phone || account.phone_number,
            isUnSavedUser: Boolean(account.uuid),
            source: account.source,
          });
        }
      });
      const chatStorageData = _.map(storageChatList, (chatItem) => {
        const lastMessageDataContent = chatItem.groupData
          ? chatItem?.lastMessageData?.content
          : null;
        return {
          chatId: chatItem.groupData
            ? chatItem.groupData.groupId
            : chatItem.chatId,
          avatarClass: chatItem.groupData
            ? chatItem.groupData?.avatarClass
            : chatItem.information?.avatarClass,
          synced: chatItem.information?.synced,
          lastMessageDataContent,
        };
      });

      return {
        validChatList: validListItem,
        storageChatAvatars: chatStorageData,
        navaUsers,
      };
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  const result = await workerFn(
    serverChatList,
    storageChatList,
    storageContacts,
  );
  return result;
};
export const orderListHandler = async (chatsList) => {
  const { workerFn } = useWebWorkerFn(
    (chatsList) => {
      const orderedList = _.orderBy(
        chatsList,
        (item) => item.timestamp,
        'desc',
      );
      return orderedList;
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  return await workerFn(chatsList);
};
export const chatListParser = async (collections, userId, userPhoneNumber) => {
  const { workerFn } = useWebWorkerFn(
    async (
      { validChatList, storageChatAvatars, navaUsers },
      currentUserId,
      currentUserPhoneNumber,
    ) => {
      const chatList = validChatList;

      function detectTextDirection(text) {
        if (!text) return null;
        text = text.replaceAll(' ', ''); // Remove spaces from the input text
        let isRightToLeft = null;
        for (let index = 0; index < text.length; index++) {
          const char = text[index];
          if (/^[\u0600-\u06FF\s]+$/.test(char)) {
            isRightToLeft = true;
            break; // Exit loop when a character is detected
          } else if (/^[A-Za-z0-9]*$/.test(char)) {
            isRightToLeft = false;
            break; // Exit loop when a character is detected
          }
        }
        return isRightToLeft;
      }
      function convertorDate(dateString) {
        const parts = dateString.split(' ');
        const datePart = parts[0];
        const timePart = parts[1].substring(0, 8);
        const fullDateString = `${datePart}T${timePart}Z`;
        return new Date(fullDateString);
      }

      let mappedList = [];
      let serviceType = [];
      let unvalidData = [];
      chatList.forEach((item) => {
        const lastMessageString = item.lastmessage;
        if (item.from == currentUserPhoneNumber) return;
        if (lastMessageString.at(-1) != '}') {
          unvalidData.push(item);
          return;
        }

        const lastMessageInfo = JSON.parse(item.lastmessage);

        const badge = item.badge;
        const isMySelf = item.from == currentUserId && item.to == currentUserId;
        const isFromMe = item.from == currentUserId;
        const chatId = item.group_id
          ? item.group_id
          : isFromMe && !isMySelf && !item.group_id
          ? item.to
          : item.from;

        if (!/^[a-z,0-9,-]{36,36}$/.test(chatId)) {
          unvalidData.push(item);
          const existInNava = navaUsers.findIndex(
            (e) => e?.phoneNumber == chatId,
          );
          const existInMappedList = mappedList.findIndex(
            (e) => e?.information?.phoneNumber == chatId,
          );

          if (existInNava != -1 || existInMappedList != -1) {
            return;
          }
        }
        const lastSeenData = {
          isSeen: Boolean(item.lastdeliverstatus),
          guid: lastMessageInfo.data.guid,
        };
        let lastMessageData = {
          textDirectionIsRight: detectTextDirection(lastMessageInfo.message),
          type: lastMessageInfo.mtype,
          guid: lastMessageInfo.data?.guid,
          content: lastMessageInfo.message,
          source: lastMessageInfo.data?.source,
        };
        const chatStorageData =
          storageChatAvatars.find((e) => e.chatId == chatId) || {};
        const userInContacts =
          navaUsers.find((e) => e.contact_username == chatId) || {};
        const avatarClass =
          chatStorageData.avatarClass ||
          userInContacts.avatarClass ||
          'avatar-color-' + _.sample([1, 2, 3, 4, 5, 6]);

        let groupData = null;
        if (item.group_id) {
          groupData = {};
          groupData.avatarClass = avatarClass;
          groupData.groupId = item.group_id;
          groupData.name = item.title;
          groupData.role = item.role;
          lastMessageData.content = chatStorageData.lastMessageDataContent;
        }
        let nicknameFromLastMessage;
        const date = convertorDate(item.creation_time);
        if (!isFromMe || (lastMessageInfo.data.service_type && !isFromMe)) {
          nicknameFromLastMessage =
            lastMessageInfo.title || lastMessageInfo.data?.nickname;
        }

        let nameOfSender = userInContacts.name || nicknameFromLastMessage || '';
        const information = {
          name: nameOfSender,
          avatarClass: avatarClass,
          phoneNumber: userInContacts.phoneNumber,
          isUnSavedUser: userInContacts.isUnSavedUser,
          source: lastMessageData.source,
        };
        if (lastMessageData.source) {
          information.name =
            lastMessageInfo.data.wch_nickname || lastMessageInfo.data.nickname;
        }
        information['textDirectionIsRight'] = detectTextDirection(
          information.name,
        );
        if (chatId == 'd50fb85d-3f42-4957-9bf5-ee9421561b22') {
          information.name = 'Support';
        }
        if (information.name != '' && information.name != null) {
          information.synced = true;
        }
        if (lastMessageInfo.data.service_type) {
          serviceType.push({
            isMySelf,
            isFromMe,
            lastMessageData,
            lastSeenData,
            groupData,
            chatId,
            date,
            timestamp: date.getTime(),
            badge,
            lastMessageInfo,
            information,
          });
          // return;
        }
        mappedList.push({
          isMySelf,
          isFromMe,
          lastMessageData,
          lastSeenData,
          groupData,
          chatId,
          date,
          timestamp: date.getTime(),
          badge,
          lastMessageInfo,
          information,
        });
      });

      return { mappedList, serviceType, unvalidData };
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  const storageNavaUsers = JSON.parse(
    JSON.stringify(collections.storageNavaUsers || []),
  );
  const storageUnsavedUsers = JSON.parse(
    JSON.stringify(collections.storageUnsavedUsers || []),
  );
  const storageChatList = JSON.parse(
    JSON.stringify(collections.storageChatList || []),
  );
  collections.storageContacts = storageNavaUsers.concat(storageUnsavedUsers);
  collections.storageChatList = storageChatList;
  const filtredList = await filterChatListParser(collections);
  const mappedData = await workerFn(filtredList, userId, userPhoneNumber);
  const orderedList = await orderListHandler(mappedData.mappedList);
  const parserResult = {
    orderedList,
    unSavedUsers: mappedData.unSavedUsers,
  };
  return parserResult;
};
export const detectNameForNotifChatList = async (userId) => {
  const baseGetProfileUrl =
    import.meta.env['VITE_APP_BASE_URL'] +
    import.meta.env['VITE_APP_UAA_DRAGON_PATH'];
  const contactsStore = useContactsStore();
  const userStore = useUserStore();
  const { workerFn } = useWebWorkerFn(
    async (
      userId,
      baseGetProfileUrl,
      token,
      sessionToken,
      navaUsers,
      unSavedNavaUsers,
    ) => {
      const url = `${baseGetProfileUrl}/get-profile/${userId}?t=${sessionToken}`;
      const user = navaUsers.find((user) => user.contact_username == userId);
      if (user) {
        return user;
      }

      const unsavedUser = unSavedNavaUsers.find((user) => user?.uuid == userId);
      if (unsavedUser) {
        return user;
      }
      return fetch(url, {
        method: 'POST', // Specify the HTTP method (GET in this case)
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data && !data.err && data.uuid && data.uuid != '') {
            return {
              ...data,
              fromFetch: true,
            };
          }
        });
    },
  );

  const navaUsers = JSON.parse(
    JSON.stringify(contactsStore.contacts.navaphoneUsers),
  );
  const unSavedNavaUsers = JSON.parse(
    JSON.stringify(contactsStore.contacts.unSavedUsers),
  );

  const result = await workerFn(
    userId,
    baseGetProfileUrl,
    userStore.token,
    userStore.sessionToken,
    navaUsers,
    unSavedNavaUsers,
  );
  if (result?.fromFetch) {
    delete result.fromFetch;
    if (result) contactsStore.contacts.unSavedUsers.push(result);
  }
  return result?.name || result?.nickname || '';
};
//
export const getUnsavedUsersInformation = async (
  targetItemId,
  token,
  sessionToken,
) => {
  const baseGetProfileUrl =
    import.meta.env['VITE_APP_BASE_URL'] +
    import.meta.env['VITE_APP_UAA_DRAGON_PATH'];
  const { workerFn } = useWebWorkerFn(
    async (targetItemId, baseGetProfileUrl, token, sessionToken) => {
      async function getProfile(userId) {
        if (!/^[a-z,0-9,-]{36,36}$/.test(userId)) {
          const result = await getProfileByNumber(userId);
          if (result && !result.err && result.uuid && result.uuid != '') {
            return getProfile(result.uuid);
          } else {
            return {};
          }
        }
        const url = `${baseGetProfileUrl}/get-profile/${userId}?t=${sessionToken}`;
        return fetch(url, {
          method: 'POST', // Specify the HTTP method (GET in this case)
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data && !data.err && data.uuid && data.uuid != '') return data;
          });
      }
      function getProfileByNumber(number) {
        const url = `${baseGetProfileUrl}/map/phone-number/${number}`;
        return fetch(url, {
          method: 'GET', // Specify the HTTP method (GET in this case)
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data && data.uuid && data.uuid != '') {
              return data;
            }
          });
      }

      return await getProfile(targetItemId);
    },
  );

  const result = await workerFn(
    targetItemId,
    baseGetProfileUrl,
    token,
    sessionToken,
  );
  return result;
};

export const generateNewDataModelItemInChatList = async ({
  message,
  currentUserId,
  currentUserPhoneNumber,
  token,
  sessionToken,
  navaUsers = [],
}) => {
  try {
    const item = message;
    const mtype = item.mtype.split('.')[1];
    if (['cst', 'mst', 'mis'].includes(mtype)) return;
    if (item.from == currentUserPhoneNumber) return null;
    const lastMessageInfo = item;

    const badge = item.badge;
    const isMySelf =
      item.from == currentUserId && item.data.to == currentUserId;
    const isFromMe = item.from == currentUserId;
    const chatId = item.group_id
      ? item.group_id
      : isFromMe && !isMySelf && !item.group_id
      ? item.data.to
      : item.from;
    const lastSeenData = {
      isSeen: Boolean(item.lastdeliverstatus),
      guid: lastMessageInfo.data.guid,
    };
    let lastMessageData = {
      textDirectionIsRight: detectTextDirection(lastMessageInfo.message),
      type: lastMessageInfo.mtype,
      guid: lastMessageInfo.data?.guid,
      content: lastMessageInfo.message,
      source: lastMessageInfo.data?.source,
    };
    const userInContacts =
      navaUsers.find(
        (e) => e?.contact_username == chatId || e?.uuid == chatId,
      ) || {};
    const avatarClass =
      userInContacts?.avatarClass ||
      'avatar-color-' + (Math.floor(Math.random() * 6) + 1);

    let groupData = null;
    if (item.group_id) {
      groupData = {};
      groupData.avatarClass = avatarClass;
      groupData.groupId = item.group_id;
      groupData.name = item.title;
      groupData.role = item.role;
      lastMessageData.content = '';
    }
    let nicknameFromLastMessage;
    const date = convertUtcToSupportedDate(item.data.ts);

    if (!isFromMe || lastMessageInfo.data.service_type) {
      nicknameFromLastMessage =
        lastMessageInfo.title || lastMessageInfo.data?.nickname;
    }

    let nameOfSender =
      userInContacts.name ||
      userInContacts.nickname ||
      nicknameFromLastMessage ||
      '';
    const information = {
      name: nameOfSender,
      avatarClass: avatarClass,
      phoneNumber: userInContacts.contact_phone || userInContacts.phone_number,
      isUnSavedUser: Boolean(
        userInContacts.phone_number || userInContacts.uuid,
      ),
      source: lastMessageData.source,
    };
    if (lastMessageData.source) {
      information.name =
        lastMessageInfo.data.wch_nickname || lastMessageInfo.data.nickname;
    }
    if (information.name == '' || information.name == null) {
      const userInformation = await getUnsavedUsersInformation(
        chatId,
        token,
        sessionToken,
      );

      information.name = userInformation.nickname || userInformation.name;
      information.phoneNumber =
        userInformation.phone_number || userInformation.contact_phone;
      information.synced = true;
    }
    information['textDirectionIsRight'] = detectTextDirection(information.name);

    const dataModel = {
      isMySelf,
      isFromMe,
      lastMessageData,
      lastSeenData,
      groupData,
      chatId,
      date,
      timestamp: date?.getTime(),
      badge,
      lastMessageInfo,
      information,
    };
    return dataModel;
  } catch (error) {
    console.log(error);
  }
};
