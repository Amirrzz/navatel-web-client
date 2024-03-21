import { useWebWorkerFn } from '@vueuse/core';
import { useGroupChat } from '@/store/chats/groupChat';
import { fileUploader } from '@/api/file/index.js';
import { generateUid } from '@/utils/generateUid.js';
import { detectReplyMessageType } from '@/helpers/chatMessageParser.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useUserStore } from '@/store/user/user.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager';
import { generateDataModelMessage } from '@/helpers/otoParser.js';

export const getChatRoomList = async (token) => {
  const baseUrl =
    import.meta.env['VITE_APP_BASE_URL'] +
    import.meta.env['VITE_APP_GROUP_PATH'] +
    '/get-list';

  const { workerFn } = useWebWorkerFn(async (baseUrl, token) => {
    const response = fetch(baseUrl, {
      method: 'GET', // Specify the HTTP method (GET in this case)
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
    const result = await response;
    return result.groups || [];
  });
  const result = await workerFn(baseUrl, token);
  return result;
};

export const prepardGroupData = async (token) => {
  const retrivalBaseUrl =
    import.meta.env['VITE_APP_BASE_URL'] +
    import.meta.env['VITE_APP_MSG_GORETRIEVAL'] +
    '/groupdetails/';
  const { workerFn } = useWebWorkerFn((baseUrl, listData, token) => {
    const promises = listData.map((item) => sendAPIRequest(item, token));
    function sendAPIRequest(groupData, token) {
      const url = baseUrl + groupData.group_id;
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
          return {
            ...data,
            ...groupData,
          };
        });
    }
    return Promise.all(promises)
      .then((data) => {
        return data;
      })
      .catch(() => {
        return [];
      });
  });
  const groupList = await getChatRoomList(token);
  const result = await workerFn(retrivalBaseUrl, groupList, token);
  return result;
};

export const makeDataModelForTextMessage = (param, data, state) => {
  const groupChat = useGroupChat();
  switch (state) {
    case 'replay':
      return {
        mtype: 'grp.txt',
        groupId: groupChat.currentGroup.group_id,
        message: param.content,
        title: groupChat.currentGroup.title,
        id: param.id,
        data: {
          ext_data: JSON.stringify({
            ReplyFromId:
              data.additionalMessageInfo.userInformation.contact_username,
            ReplyFromName: data.additionalMessageInfo.userInformation.nickname,
            replyDescription: data.content,
            replyFileId: '',
            replyMsgId: data.id,
            replyType: 3,
          }),
        },
      };
      break;
    case 'edit':
      break;
    case 'text':
      return {
        mtype: 'grp.txt',
        groupId: groupChat.currentGroup.group_id,
        message: param.content,
        title: groupChat.currentGroup.title,
        id: param.id,
        guid: '',
        data: {},
      };
      break;
  }
};

export const makeDataModelForImage = async (param) => {
  const fileId = await fileUploader(param.files[0]);
  const groupChat = useGroupChat();
  return {
    mtype: 'grp.img',
    groupId: groupChat.currentGroup.group_id,
    id: param.id,
    title: groupChat.currentGroup.title,
    message: '',
    data: {
      fileId: fileId,
      name: param.files[0].name,
      size: param.files[0].size,
      type: param.files[0].type,
    },
  };
};

export const makeDataModelForFile = async (param) => {
  const fileId = await fileUploader(param.files[0]);
  const groupChat = useGroupChat();
  return {
    mtype: 'grp.doc',
    groupId: groupChat.currentGroup.group_id,
    id: param.id,
    title: groupChat.currentGroup.title,
    message: '',
    data: {
      fileId: fileId,
      name: param.files[0].name,
      size: param.files[0].size,
      type: param.files[0].type,
    },
  };
};

export const makeDataModelForVideo = async (param) => {
  const fileId = await fileUploader(param.files[0]);
  const groupChat = useGroupChat();
  return {
    mtype: 'grp.vid',
    groupId: groupChat.currentGroup.group_id,
    id: param.id,
    title: groupChat.currentGroup.title,
    message: '',
    data: {
      fileId: fileId,
      name: param.files[0].name,
      size: param.files[0].size,
      type: param.files[0].type,
      dim: param.files[0]?.dimension
        ? `${param.files[0].dimension.width}x${param.files[0].dimension.height}`
        : null,
      duration: +param.files[0].duration,
    },
  };
};

export const makeDataModelForVoice = async (param) => {
  const fileId = await fileUploader(param.file);
  const groupChat = useGroupChat();
  return {
    mtype: 'grp.aud',
    groupId: groupChat.currentGroup.group_id,
    id: param.id,
    title: groupChat.currentGroup.title,
    message: '',
    data: {
      fileId: fileId,
      name: param.file.name,
      size: param.file.size,
      type: param.file.type,
      duration: param.file.duration,
      sample: 'AAAAAA==',
    },
  };
};

export const makeDataModelForSticker = async (param) => {
  const fileId = await fileUploader(param.file);
  const groupChat = useGroupChat();
  return {
    mtype: 'grp.stk',
    groupId: groupChat.currentGroup.group_id,
    id: param.id,
    title: groupChat.currentGroup.title,
    message: '',
    data: {
      fileId: fileId,
    },
  };
};

export const makeDataModelForDeleteMessage = (param) => {
  const groupChat = useGroupChat();
  return {
    mtype: 'grp.del',
    groupId: groupChat.currentGroup.group_id,
    id: param.id,
    title: groupChat.currentGroup.title,
    message: param.message,
    data: { guid: param.guid },
  };
};

export const makeDataModelForForwordMessage = (param, groupId) => {
  let name = null;
  if (param.targetName) {
    name = param.targetName;
  } else if (param.additionalMessageInfo.userInformation.name) {
    name = param.additionalMessageInfo.userInformation.name;
  } else if (param.additionalMessageInfo.userInformation.nickname) {
    name = param.additionalMessageInfo.userInformation.nickname;
  } else {
    name = param.additionalMessageInfo.nickname;
  }
  switch (param.type) {
    case 'text':
      return {
        mtype: 'grp.txt',
        groupId: groupId,
        message: param.content,
        id: generateUid(50),
        data: {
          ext_data: JSON.stringify({
            forwardFromId: param.additionalMessageInfo.uuid,
            forwardFromName: name,
            forwardSType: detectReplyMessageType(param.type),
            forwardMsgId: param.id,
          }),
        },
      };
      break;
    case 'image':
      return {
        mtype: 'grp.img',
        groupId: groupId,
        message: param.content,
        id: generateUid(50),
        data: {
          dim: `${param.dimension.renderedWidth}x${param.dimension.renderedHeight}`,
          size: param.additionalMessageInfo?.size,
          duration: +param.additionalMessageInfo.duration,
          ext_data: JSON.stringify({
            forwardFromId: param.additionalMessageInfo.uuid,
            forwardFromName: name,
            forwardSType: detectReplyMessageType(param.type),
            forwardMsgId: param.id,
          }),
        },
      };
      break;
    case 'file':
      return {
        mtype: 'grp.doc',
        groupId: groupId,
        message: param.content,
        id: generateUid(50),
        data: {
          fileId: param.additionalMessageInfo.fileId,
          name: param.additionalMessageInfo?.name,
          size: param.additionalMessageInfo?.size,
          ext_data: JSON.stringify({
            forwardFromId: param.additionalMessageInfo.uuid,
            forwardFromName: name,
            forwardSType: detectReplyMessageType(param.type),
            forwardMsgId: param.id,
          }),
        },
      };
      break;
    case 'video':
      return {
        mtype: 'grp.vid',
        groupId: groupId,
        message: param.content,
        id: generateUid(50),
        data: {
          fileId: param.additionalMessageInfo.fileId,
          dim: param.additionalMessageInfo.dim,
          size: param.additionalMessageInfo?.size,
          duration: +param.additionalMessageInfo.duration,
          type: param.additionalMessageInfo.type,
          name: param.additionalMessageInfo.name,
          ext_data: JSON.stringify({
            forwardFromId: param.additionalMessageInfo.uuid,
            forwardFromName: name,
            forwardSType: detectReplyMessageType(param.type),
            forwardMsgId: param.id,
          }),
        },
      };
      break;
    case 'audio':
      return {
        mtype: 'grp.aud',
        groupId: groupId,
        message: param.content,
        id: generateUid(50),
        data: {
          fileId: param.additionalMessageInfo.fileId,
          size: param.additionalMessageInfo?.size,
          duration: +param.additionalMessageInfo.duration,
          type: param.additionalMessageInfo.type,
          name: param.additionalMessageInfo.name,
          ext_data: JSON.stringify({
            forwardFromId: param.additionalMessageInfo.uuid,
            forwardFromName: name,
            forwardSType: detectReplyMessageType(param.type),
            forwardMsgId: param.id,
          }),
        },
      };
      break;
  }
};

export const makeDataModelForSeen = async (param, groupId) => {
  return {
    mtype: 'grp.mst',
    to: groupId,
    id: generateUid(50),
    data: { guid: param.id, stt: 5 },
  };
};

export const receivedMessageHandler = async (responseFromSocket, itsMeFlag) => {
  const overallChatsStore = useOverallChatsStore();
  const userStore = useUserStore();
  const fileManagerStore = useFileManagerStore();
  const groupChatStore = useGroupChat();

  const targetChat = overallChatsStore.chatsList.find((chat) => {
    return chat.chatId == responseFromSocket.to;
  });

  if (userStore.userId != responseFromSocket.from) {
    switch (responseFromSocket.mtype) {
      // ******************* in notif status ******************* //
      case 'grp.cfg.avt':
        const downloadImageFile = await fileManagerStore.handlerForGettingFile(
          responseFromSocket.data.value,
          'image',
          false,
        );
        groupChatStore.currentGroup.avatar = downloadImageFile.filePath;
        break;
      case 'grp.cfg.tit':
        groupChatStore.currentGroup.title = responseFromSocket.data.value;
        break;
      case 'grp.add':
        await groupChatStore.updateGroupMemberList(responseFromSocket.to);
        break;
      case 'grp.rmv':
        await groupChatStore.updateGroupMemberList(responseFromSocket.to);
        break;
      case 'grp.adm.add':
        await groupChatStore.updateGroupMemberList(responseFromSocket.to);
        break;
      case 'grp.adm.rmv':
        await groupChatStore.updateGroupMemberList(responseFromSocket.to);
        break;
      // ******************* in notif status ******************* //

      // ******************* in messages status ******************* //
      case 'grp.mst':
        const targetMessage = groupChatStore.currentGroup.messages.find(
          (msg) => {
            return msg.id == responseFromSocket.data.guid;
          },
        );
        targetMessage.status = 'seen';
        break;
      case 'grp.txt':
        const newMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'text',
          groupChatStore.currentGroup.members,
        );
        groupChatStore.currentGroup.messages.push(newMessage);
        break;
      case 'grp.doc':
        const newFile = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'file',
          groupChatStore.currentGroup.members,
        );
        groupChatStore.currentGroup.messages.push(newFile);
        break;
      case 'grp.aud':
        const newVoice = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'audio',
          groupChatStore.currentGroup.members,
        );
        groupChatStore.currentGroup.messages.push(newVoice);
        break;
      case 'grp.img':
        const newImageMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'image',
          groupChatStore.currentGroup.members,
        );
        groupChatStore.currentGroup.messages.push(newImageMessage);
        break;
      case 'grp.vid':
        const newVideoMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'video',
          groupChatStore.currentGroup.members,
        );
        groupChatStore.currentGroup.messages.push(newVideoMessage);
        break;
      // ******************* in messages status ******************* //
    }
  } else {
    targetChat.badge = 0;
    await overallChatsStore.updateListFromGroupData(responseFromSocket);
    switch (responseFromSocket.mtype) {
      case 'grp.txt':
        let newTextMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'text',
          groupChatStore.currentGroup.members,
        );
        const targetTextMessage = groupChatStore.currentGroup.messages.find(
          (message) => {
            if (message.id) {
              return message.id == newTextMessage.additionalMessageInfo.id;
            }
          },
        );
        newTextMessage.status = 'sent';
        const detectIndex =
          groupChatStore.currentGroup.messages.indexOf(targetTextMessage);
        groupChatStore.currentGroup.messages[detectIndex] = newTextMessage;
        break;
      case 'grp.img':
        let newImageMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'image',
          groupChatStore.currentGroup.members,
        );
        const targetImageMessage = groupChatStore.currentGroup.messages.find(
          (message) => {
            if (message.id) {
              return message.id == newImageMessage.additionalMessageInfo.id;
            }
          },
        );
        newImageMessage.status = 'sent';
        const detectImageIndex =
          groupChatStore.currentGroup.messages.indexOf(targetImageMessage);
        groupChatStore.currentGroup.messages[detectImageIndex] =
          newImageMessage;
        break;
      case 'grp.doc':
        let newFileMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'file',
          groupChatStore.currentGroup.members,
        );
        const targetFileMessage = groupChatStore.currentGroup.messages.find(
          (message) => {
            if (message.id) {
              return message.id == newFileMessage.additionalMessageInfo.id;
            }
          },
        );
        newFileMessage.status = 'sent';
        const detectFileIndex =
          groupChatStore.currentGroup.messages.indexOf(targetFileMessage);
        groupChatStore.currentGroup.messages[detectFileIndex] = newFileMessage;
        break;
      case 'grp.vid':
        let newVideoMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'video',
          groupChatStore.currentGroup.members,
        );
        const targetVideoMessage = groupChatStore.currentGroup.messages.find(
          (message) => {
            if (message.id) {
              return message.id == newVideoMessage.additionalMessageInfo.id;
            }
          },
        );
        newVideoMessage.status = 'sent';
        const detectVideoIndex =
          groupChatStore.currentGroup.messages.indexOf(targetVideoMessage);
        groupChatStore.currentGroup.messages[detectVideoIndex] =
          newVideoMessage;
        break;
      case 'grp.aud':
        let newVoiceMessage = generateDataModelMessage(
          responseFromSocket,
          itsMeFlag,
          null,
          'video',
          groupChatStore.currentGroup.members,
        );
        const targetVoiceMessage = groupChatStore.currentGroup.messages.find(
          (message) => {
            if (message.id) {
              return message.id == newVoiceMessage.additionalMessageInfo.id;
            }
          },
        );
        newVoiceMessage.status = 'sent';
        const detectVoiceIndex =
          groupChatStore.currentGroup.messages.indexOf(targetVoiceMessage);
        groupChatStore.currentGroup.messages[detectVoiceIndex] =
          newVoiceMessage;
        break;
    }
  }
};

export const notificationTypeHanlder = (notif) => {
  switch (notif) {
    case 'lft':
      return true;
      break;
    case 'crt':
      return true;
      break;
    case 'add':
      return true;
      break;
    case 'jnd':
      return true;
      break;
    case 'rmv':
      return true;
      break;
    case 'cfg.tit':
      return true;
      break;
    case 'cfg.avt':
      return true;
      break;
    default:
      return false;
      break;
  }
};
