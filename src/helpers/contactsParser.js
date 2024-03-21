import { useWebWorkerFn } from '@vueuse/core';
import { useContactsStore } from '@/store/contacts/contacts';

export const filterContactsParser = async (serverList, storageList) => {
  const { workerFn } = useWebWorkerFn(
    (serverListData, storageListData) => {
      let navaUsersList = [];
      let withoutNavaUsersList = [];
      _.forEach(serverListData, (account) => {
        if (account.contact_phone && account.name && !account.deleted) {
          if (account.contact_username) {
            navaUsersList.push({
              ...account,
              toLowerName: account.name.toLowerCase(),
            });
          } else {
            withoutNavaUsersList.push({
              ...account,
              toLowerName: account.name.toLowerCase(),
            });
          }
        }
      });
      let navaUsersStorageList = [];
      _.forEach(storageListData.navaphoneUsers, (account) => {
        if (account.category == null) {
          navaUsersStorageList.push({
            contact_username: account.contact_username,
            avatarClass: account.avatarClass,
          });
        }
      });
      let withoutNavaUsersStorageList = [];
      _.forEach(storageListData.withoutNavaphoneUsers, (account) => {
        withoutNavaUsersStorageList.push({
          contact_phone: account.contact_phone,
          avatarClass: account.avatarClass,
        });
      });

      return {
        serverData: {
          navaUsersList,
          withoutNavaUsersList,
        },
        storageData: {
          navaUsersList: navaUsersStorageList,
          withoutNavaUsersList: withoutNavaUsersStorageList,
        },
      };
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  return await workerFn(serverList, storageList);
};
export const contactsParser = async (serverList, storageList) => {
  const { workerFn } = useWebWorkerFn(
    (listData) => {
      const serverData = listData.serverData;
      const storageData = listData.storageData;
      const storageNavaphoneUsers = storageData.navaUsersList;
      const storageWithoutNavaphoneUsers = storageData.withoutNavaUsersList;
      let navaphoneUsers;
      let withoutNavaphoneUsers;
      ///
      navaphoneUsers = _.sortBy(serverData.navaUsersList, 'toLowerName');
      withoutNavaphoneUsers = _.sortBy(
        serverData.withoutNavaUsersList,
        'toLowerName',
      );

      finalNavaphoneUsers = [];
      _.forEach(navaphoneUsers, (account, index, arr) => {
        const avatarClass =
          storageNavaphoneUsers.find(
            (e) => e.contact_username == account.contact_username,
          )?.avatarClass || 'avatar-color-' + _.sample([1, 2, 3, 4, 5, 6]);
        ////
        const name = account.name;
        const firstChar = name[0].toUpperCase().toString();
        const id = account.contact_phone + name + account.contact_username;
        ////
        account['textDirectionIsRight'] = detectTextDirection(name);
        account['firstChar'] = firstChar;
        account['id'] = id;
        account['avatarClass'] = avatarClass;
        /////
        if (index == 0)
          finalNavaphoneUsers.push(
            {
              category: firstChar,
              id: id + '__' + firstChar,
            },
            account,
          );
        if (index > 0 && arr[index - 1].firstChar == firstChar)
          finalNavaphoneUsers.push(account);
        if (index > 0 && arr[index - 1].firstChar != firstChar)
          finalNavaphoneUsers.push(
            {
              category: firstChar,
              id: id + '__' + firstChar + '__',
            },
            account,
          );
        ////
      });
      _.forEach(withoutNavaphoneUsers, (account) => {
        const avatarClass =
          storageWithoutNavaphoneUsers.find(
            (e) => e.contact_phone == account.contact_phone,
          )?.avatarClass || 'avatar-color-' + _.sample([1, 2, 3, 4, 5, 6]);
        ///
        const firstChar = account.name[0].toUpperCase().toString();
        ///
        account['textDirectionIsRight'] = detectTextDirection(account.name);
        account['avatarClass'] = avatarClass;
        account['id'] = account.contact_phone + account.name;
        account['firstChar'] = firstChar;
      });
      return {
        navaphoneUsers: finalNavaphoneUsers,
        withoutNavaphoneUsers: withoutNavaphoneUsers,
      };
      function detectTextDirection(text) {
        const newText = [...text.replaceAll(' ', '')];
        for (let index = 0; index < newText.length; index++) {
          if (/^[\u0600-\u06FF\s]+$/.test(newText[index])) {
            return true;
          } else if (/^[A-Za-z0-9]*$/.test(newText[index])) {
            return false;
          }
        }
        return null;
      }
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  const filtredData = await filterContactsParser(serverList, storageList);
  const parsedListData = await workerFn(filtredData);
  return parsedListData;
};
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
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
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

export const detectNumberInContactList = (phoneNumber) => {
  const contactsStore = useContactsStore();
  const contacts = contactsStore.contacts.navaphoneUsers;
  const result = contacts.find((contact) => {
    return contact.contact_phone == phoneNumber;
  });
  return result;
};
