import { useWebWorkerFn } from '@vueuse/core';
import { useUserStore } from '@/store/user/user.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { dateFormatterWorker } from '@/helpers/dateAndTimeFormatter.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager';

const baseUrl = import.meta.env['VITE_APP_BASE_URL'] + 'status/api/v1';

export const sendRequestStatus = async (userId, tokenUser, locale) => {
  const { workerFn } = useWebWorkerFn(async (url, token) => {
    const response = fetch(url, {
      method: 'GET', // Specify the HTTP method (GET in this case)
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
    const result = await response;
    return result;
  });

  const result = await workerFn(baseUrl + '/get/' + userId, tokenUser);
  const formattedDate = await dateFormatterWorker(result.updated_at, locale);
  return {
    ...result,
    time: formattedDate,
  };
};
const baseUrlFile =
  import.meta.env['VITE_APP_BASE_URL'] + import.meta.env['VITE_APP_TUS_PATH'];
export const getFile = async (fileId, token, type, customBaseUrl) => {
  const baseUrl = customBaseUrl || baseUrlFile;
  const { workerFn } = useWebWorkerFn(async (url, token) => {
    const blob = fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const reader = response.body.getReader();
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                //  prepard persantage to rendering in ui of we want to
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      // Create a new response out of the stream
      .then((stream) => new Response(stream))
      // Create an object URL for the response
      .then((response) => response.blob())
      .then((blob) => blob)
      // Update image
      .catch(() => true);
    return blob;
  });
  const url = `${baseUrl}/download/${type}/${fileId}`;
  const result = await workerFn(url, token);
  const filePath = URL.createObjectURL(result);
  return {
    filePath,
    blob: result,
  };
};

export const proxyParser = (proxy) => {
  const proxyParser = JSON.stringify(proxy);
  const result = JSON.parse(proxyParser);
  return result;
};

export const handlerForSingleStickerData = async (allFileId) => {
  const fileManagerStore = useFileManagerStore();
  const stickers = [];
  for (let i of allFileId.stickers) {
    const stickerUrl = await fileManagerStore.handlerForSticker(
      i.file_id,
      'image',
      false,
    );
    const result = { url: stickerUrl.filePath, fileId: i.file_id, id: i.id };
    stickers.push(result);
  }
  return stickers;
};

export const detectNameForNotifChatList = async (userID) => {
  const contactsStore = useContactsStore();
  let name = null;
  const navaUser = contactsStore.contacts.navaphoneUsers.find((user) => {
    return user.contact_username == userID;
  });
  if (navaUser) {
    name = navaUser.name;
  } else {
    const targetUser = await contactsStore.getContactInformation(userID);
    name = targetUser.nickname;
  }
  return name;
};

export const MembersParser = async (navaphoneContacts, membersUid) => {
  const contactsStore = useContactsStore();
  const currentMemberGroup = [];
  let memberIdInCurrentGroup = '';
  for (const i of membersUid) {
    memberIdInCurrentGroup = i.uuid;
    const targetContact = await contactsStore.getContactInformation(
      memberIdInCurrentGroup,
    );
    const member = {
      role: i.role,
      contact_username: targetContact.uuid,
      phone_number: targetContact.phone_number,
      nickname: targetContact.nickname,
      avatar: targetContact.avatar,
    };
    const navaUser = navaphoneContacts.find((m) => {
      return m.contact_username == member.contact_username;
    });
    const result = { ...navaUser, ...member };
    currentMemberGroup.push(result);
  }
  return currentMemberGroup;
};

export const memberMaker = async (memberId) => {
  const contactsStore = useContactsStore();
  const targetContact = await contactsStore.getContactInformation(memberId);
  const navaUser = contactsStore.contacts.navaphoneUsers.find((m) => {
    return m.contact_username == memberId;
  });
  return { ...targetContact, ...navaUser };
};

export const detectRepetitiousGroupMember = async (conatcts, members) => {
  return [
    ...conatcts.filter((contact) =>
      members.every((member) => member.id != contact.id),
    ),
    ...members.filter((contact) =>
      conatcts.every((member) => member.id != contact.id),
    ),
  ];
};

export const detectCallForRemovelist = async (callHistory, list) => {
  return [
    ...callHistory.filter((call) => list.every((index) => index.id != call.id)),
    ...list.filter((item) => callHistory.every((index) => index.id != item.id)),
  ];
};

export const handlerCurrenGroupMessagesMaker = async (groupMembers, param) => {
  const messages = [];
  for (let message of param.messages) {
    const bodyParser = JSON.parse(message.body);
    let result = null;
    const targetMember = groupMembers.find((member) => {
      return member.contact_username == message.from;
    });
    result = {
      ...message,
      ...targetMember,
      body: bodyParser,
      loading: false,
      avatarFlag: false,
    };
    messages.push(result);
  }
  return messages.reverse();
};

export const handleMessagesMakerAfterScroll = async (groupMembers, param) => {
  const messages = [];
  for (let message of param) {
    const bodyParser = JSON.parse(message.body);
    let result = null;
    const targetMember = groupMembers.find((member) => {
      return member.contact_username == message.from;
    });
    result = {
      ...message,
      ...targetMember,
      body: bodyParser,
      loading: false,
      avatarFlag: false,
    };
    messages.push(result);
  }
  return messages;
};

export const handlerStickerMessagesMaker = async (navaphoneContacts, param) => {
  const contactsStore = useContactsStore();
  const userStore = useUserStore();
  const targetMember = await contactsStore.getContactInformation(param.from);
  const member = {
    avatar: targetMember.avatar,
    nickname: targetMember.nickname,
    from: param.from,
  };
  const navaUser = navaphoneContacts.find((m) => {
    return m.contact_username == member.from;
  });
  const resultUser = { ...navaUser, ...member };
  const blobFile = await getFile(param.data.file_id, userStore.token, 'image');
  const result = {
    ...param,
    ...resultUser,
    body: {
      data: {
        ...param.data,
        blob: blobFile.filePath,
      },
      message: param.message,
      mtype: 'grp.stk',
    },
    loading: false,
    deliverstatus: 0,
    creation_time: param.data.ts,
    guid: param.data.guid,
  };
  return result;
};

export const handlerEditMessagesMaker = async (navaphoneContacts, param) => {
  const contactsStore = useContactsStore();
  const targetMember = await contactsStore.getContactInformation(param.from);
  const member = {
    avatar: targetMember.avatar,
    nickname: targetMember.nickname,
    from: param.from,
  };
  const navaUser = navaphoneContacts.find((m) => {
    return m.contact_username == member.from;
  });
  const resultUser = { ...navaUser, ...member };
  const result = {
    ...param,
    ...resultUser,
    body: {
      edit_state: 1,
      data: {
        ...param.data,
      },
      ...param.data,
      message: param.message,
    },
    loading: false,
    deliverstatus: 1,
    creation_time: param.data.ts,
    guid: param.data.guid,
  };
  return result;
};

export const getBowserName = () => {
  const agent = window.navigator.userAgent.toLowerCase();
  switch (true) {
    case agent.indexOf('edge') > -1:
      return 'MS Edge';
    case agent.indexOf('edg/') > -1:
      return 'Edge ( chromium based)';
    case agent.indexOf('opr') > -1 && !!window.opr:
      return 'Opera';
    case agent.indexOf('chrome') > -1 && !!window.chrome:
      return 'Chrome';
    case agent.indexOf('trident') > -1:
      return 'MS IE';
    case agent.indexOf('firefox') > -1:
      return 'Mozilla Firefox';
    case agent.indexOf('safari') > -1:
      return 'Safari';
    default:
      return 'other';
  }
};

export const getOsOfUser = () => {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const osList = [
    { name: 'Windows 3.11', regex: /Win16/ },
    { name: 'Windows 95', regex: /(Windows 95)|(Win95)|(Windows_95)/ },
    // Add more OS and corresponding regex patterns as needed
    { name: 'Windows 10', regex: /(Windows NT 10.0)/ },
    { name: 'Windows 8.1', regex: /(Windows NT 6.3)/ },
    { name: 'Windows 8', regex: /(Windows NT 6.2)/ },
    { name: 'Windows 7', regex: /(Windows NT 6.1)/ },
    { name: 'Windows Vista', regex: /(Windows NT 6.0)/ },
    { name: 'Windows XP', regex: /(Windows NT 5.1)|(Windows XP)/ },
    { name: 'macOS', regex: /(Mac_PowerPC)|(Macintosh)|(Mac OS X)/ },
    { name: 'Linux', regex: /(Linux)|(X11)/ },
    { name: 'iOS', regex: /(iPhone)|(iPad)|(iPod)/ },
    { name: 'Android', regex: /Android/ },
  ];

  for (const os of osList) {
    if (os.regex.test(userAgent) || os.regex.test(platform)) {
      return os.name;
    }
  }

  return 'Unknown'; // If the OS cannot be identifi
};

export const detectOsForNavigate = () => {
  const osWidth = window.screen.width;
  if (osWidth > 600) {
    return '/desktop/message';
  } else {
    return '/callpad';
  }
};

export function scrollToRight(element, duration) {
  var start = element.scrollLeft;
  var end = element.scrollWidth - element.clientWidth;

  var startTime = performance.now();

  function scroll(timestamp) {
    var progress = Math.min(1, (timestamp - startTime) / duration);
    element.scrollLeft = start + progress * (end - start);

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }

  requestAnimationFrame(scroll);
}
