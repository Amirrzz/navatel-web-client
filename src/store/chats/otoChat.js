import { defineStore } from 'pinia';
import {
  sendMessage,
  getPreviouslyMessages,
  getTargetMessage,
  getNextMessages,
  getFirstMessage,
} from '@/api/OTO/index.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { v1 as idGenerator } from 'uuid';
import {
  chatsParser,
  generateDataModelMessage,
  keepUniqueAndUpdate,
} from '@/helpers/otoParser.js';
import { useUserStore } from '@/store/user/user.js';
import { useObjectUrl } from '@vueuse/core';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { detectFileTypeForSendingMessage } from '@/helpers/chatMessageParser.js';
import { useMessangerHanlder } from '@/store/chats/messageHandlers.js';
import { useThemeStore } from '@/store/theme.js';
export const useOtoStore = defineStore('OtoStore', {
  state: () => ({
    chatList: {},
    currentChatId: '',
    scrollerElement: null,
    showLoading: false,
    chatData: {},
  }),
  getters: {
    getCurrentChat(state) {
      if (
        state.currentChatId &&
        state.chatList[state.currentChatId]?.messages
      ) {
        return state.chatList[state.currentChatId].messages;
      }
      return [];
    },
    getHasPrevMessages(state) {
      return state.chatList[state.currentChatId]?.hasPrevMessages;
    },
  },
  actions: {
    async prepardStartChatData(
      chatId,
      lastMessageId,
      lastSeenMessageId,
      source,
    ) {
      if (!this.chatList[chatId]) {
        this.showLoading = true;
        this.chatList[chatId] = {
          messages: [],
          firstMessageId: '',
          hasPrevMessages: null,
        };
      }
      const messangerStore = useMessangerHanlder();
      const functionData = messangerStore.getMessageHandler({
        chatId,
        lastMessageId,
        lastSeenMessageId,
        source,
      });
      this.chatList[chatId].hasPrevMessages = false;
      await this[functionData.target](functionData.arguments);
      // call above actions
      return true;
    },

    getFirstMessages({ chatId, count = 50, source }) {
      return getFirstMessage(chatId, count).then(async (result) => {
        const parsedList = await this.getParsedMessages({
          listData: result,
          source,
        });
        this.assignerMessageToList({
          parsedList,
          chatId,
          addToEndList: false,
        });
      });
    },
    getPrevMessages({ chatId, targetMessageId, count, source, isDuringChat }) {
      return getPreviouslyMessages(chatId, targetMessageId, count).then(
        async (result) => {
          const parsedList = await this.getParsedMessages({
            listData: result,
            source,
            targetMessageId,
          });
          return this.assignerMessageToList({
            parsedList,
            addToEndList: false,
            isDuringChat,
          });
        },
      );
    },

    getNextMessages({ chatId, targetMessageId, count, source, isDuringChat }) {
      return getNextMessages(chatId, targetMessageId, count).then(
        async (result) => {
          const parsedList = await this.getParsedMessages({
            listData: result,
            source,
            targetMessageId,
          });
          return this.assignerMessageToList({
            parsedList,
            chatId,
            addToEndList: true,
          });
        },
      );
    },
    async getNextAndPrevMessages({
      chatId,
      targetMessageId,
      prevCounts = 50,
      nextCounts = 100,
      source,
      isDuringChat,
      isEndPointer = false,
    }) {
      let prevMessages = [];
      if (!isEndPointer) {
        prevMessages = await getPreviouslyMessages(
          chatId,
          targetMessageId,
          prevCounts,
        );
      }

      const nextMessages = await getNextMessages(
        chatId,
        targetMessageId,
        nextCounts,
      );
      const prevMessagesParsedList = await this.getParsedMessages({
        listData: prevMessages,
        source,
      });
      const nextMessagesParsedList = await this.getParsedMessages({
        listData: nextMessages,
        source,
      });
      const indexTargetMessageInPrevMessages = prevMessagesParsedList.findIndex(
        (e) => e.id == targetMessageId,
      );
      const indexTargetMessageInNextMessages = nextMessagesParsedList.findIndex(
        (e) => e.id == targetMessageId,
      );
      if (indexTargetMessageInPrevMessages != -1) {
        prevMessagesParsedList.splice(indexTargetMessageInPrevMessages, 1);
      }
      if (indexTargetMessageInNextMessages != -1) {
        nextMessagesParsedList.splice(indexTargetMessageInNextMessages, 1);
      }
      const targetMessage = await getTargetMessage(chatId, targetMessageId);
      let parsedTargetMessage = await this.getParsedMessages({
        listData: [targetMessage],
        source,
      });
      parsedTargetMessage = parsedTargetMessage[0];
      if (nextMessagesParsedList && nextMessagesParsedList.length >= 99) {
        nextMessagesParsedList[50].endPointerData = {
          targetMessageIdForNextMessages: nextMessagesParsedList[0].id,
        };
      } else {
        this.removeEndPointerProperyOfMessageData({
          forceRemoveEndPointers: true,
        });
      }
      prevMessagesParsedList.push(parsedTargetMessage);
      const mergedList = prevMessagesParsedList.concat(nextMessagesParsedList);
      return mergedList;
    },

    async repliedMessageHandler({
      chatId,
      targetMessageId,
      source,
      isEndPointer = false,
    }) {
      return this.getNextAndPrevMessages({
        chatId,
        targetMessageId,
        isDuringChat: true,
        isEndPointer,
      }).then(async (mergedList) => {
        const parsedList = await keepUniqueAndUpdate({
          oldList: this.getCurrentChat,
          newList: mergedList,
        });
        return this.assignerMessageToList({
          parsedList,
          assignDirectly: true,
          isDuringChat: true,
          doseScroll: false,
        }).then(() => {
          const indexMessageInList = this.chatList[chatId].messages.findIndex(
            (e) => e.id == targetMessageId,
          );
          return {
            repliedTargetId: targetMessageId,
            indexMessageInList: indexMessageInList,
          };
        });
      });
    },
    removeEndPointerProperyOfMessageData({
      targetMessageId,
      chatId = this.currentChatId,
      forceRemoveEndPointers,
    }) {
      if (forceRemoveEndPointers) {
        this.chatList[chatId].messages.forEach((e) => {
          delete e.endPointerData;
        });
        return;
      }
      return new Promise((resolve, reject) => {
        const messageIndex = this.chatList[chatId].messages.findIndex(
          (e) => e.id == targetMessageId,
        );
        if (messageIndex != -1)
          delete this.chatList[chatId].messages[messageIndex].endPointerData;
        resolve(true);
      });
    },
    setLoadingStateForRepliedMesage({ chatId, messageId, isLoading }) {
      const message = this.chatList[chatId].messages.find(
        (e) => e.id == messageId,
      );
      if (!isLoading) delete message.repliedData.isLoading;
      else message.repliedData.isLoading = true;
    },
    async getParsedMessages({ listData, targetMessageId, source }) {
      const userStore = useUserStore();
      const themeStore = useThemeStore();
      const userId = userStore.userId;
      const parsedList = await chatsParser(
        listData,
        userId,
        source,
        null,
        0,
        targetMessageId,
      );
      return parsedList;
    },
    async assignerMessageToList({
      parsedList,
      chatId = this.currentChatId,
      addToEndList = false,
      assignDirectly = false,
      isDuringChat,
      doseScroll = true,
    }) {
      console.log(parsedList, 'kpkokpkp');
      if (isDuringChat) {
        if (addToEndList) {
          this.chatList[chatId].messages.push(...parsedList);
        } else if (assignDirectly) {
          this.chatList[chatId].messages = parsedList;
        } else {
          this.chatList[chatId].messages.unshift(...parsedList);
        }
        if (doseScroll)
          requestAnimationFrame(() => {
            const scrollToIndex = parsedList.length;
            // this.scrollerElement?.scrollToItem(scrollToIndex);
          });
      } else {
        this.chatList[chatId].messages = parsedList;
      }
      this.showLoading = false;
      return this.updateChatStatusInformation(chatId);
    },

    updateChatStatusInformation(chatId, count = 1) {
      return getFirstMessage(chatId, count).then((result) => {
        const firstMessageId = result[0]?.guid;
        const firstExistMessage = this.chatList[chatId].messages[0].id;
        const hasPrevMessages = !Boolean(firstMessageId == firstExistMessage);
        this.chatList[chatId].firstMessageId = firstMessageId;
        this.chatList[chatId].hasPrevMessages = hasPrevMessages;
        return true;
      });
    },

    send({
      text,
      title,
      files,
      textDirectionIsRtl,
      repliedData,
      forwardedData,
      forceFileType,
      webChatData,
      chatId,
    }) {
      console.log('title for notification', title);
      const currentChatId = chatId || this.currentChatId;
      // This functionality detect is message is text or file
      // if you pass files parameter to this function it detects message as file message
      // This condition detect message is text message
      if (!files || files.length == 0) {
        const information = {
          to: currentChatId, // it`s equal to userId
          id: idGenerator(),
          message: text,
          mtype: 'oto.txt',
          title: title,
          data: {
            ...webChatData,
            ext_data: JSON.stringify(repliedData?.ext_data),
          },
        };
        this.addManuallyChatItemToChatList(
          information,
          currentChatId,
          textDirectionIsRtl,
          'text',
        );
        return sendMessage(information).then((result) => {
          const { uuid, id, guid } = result;
          this.updateIdMessage({
            chatId: uuid,
            id,
            guid,
          });
        });
      }

      // Here is File Message part functionality
      // first convert object type files to array
      const filesArray = Object.values(files);
      // upload each file to server by fileManager store
      const fileManagerStore = useFileManagerStore();

      filesArray.forEach((file, index) => {
        const additionalMessageInfo = detectFileTypeForSendingMessage(
          file.type,
          forceFileType,
        );
        const previewImage = useObjectUrl(file).value;
        const tempFileId = idGenerator() + '-temp-file-id';
        let information = {
          to: currentChatId, // its same userId (uuid)
          id: idGenerator(),
          message: additionalMessageInfo.notificationTitle,
          mtype: additionalMessageInfo.type, // oto.img || oto.vid || oto.aud || oto.doc
          title: title, // Nick Name of user that send message
          // for sending file as a message this property is needed
          data: {
            fileId: tempFileId,
            description: '',
            md5: 'cudFile.md5',
            name: file.name,
            size: file.size.toString(),
            type: forceFileType ? 'oto.doc' : file.type,
            dim: file?.dimension
              ? `${file.dimension.width}x${file.dimension.height}`
              : null,
            duration: +file.duration,
            ...webChatData,
            ext_data: JSON.stringify(repliedData?.ext_data),
          },
          previewBlob: previewImage,
          status: 'sending',
        };
        this.addManuallyChatItemToChatList(
          information,
          currentChatId,
          textDirectionIsRtl,
          additionalMessageInfo.type,
        );
        return fileManagerStore.uploadFile(file, tempFileId).then((fileId) => {
          if (text != null && text != '' && filesArray.length - 1 == index) {
            information.data.description = text;
          }
          information['data'].fileId = fileId;
          const findTempFileIdIndex = this.chatList[
            currentChatId
          ].messages.findLastIndex((e) => e.content == tempFileId);
          if (findTempFileIdIndex != -1) {
            this.chatList[currentChatId].messages[findTempFileIdIndex].content =
              fileId;
            this.chatList[currentChatId].messages[
              findTempFileIdIndex
            ].additionalMessageInfo.fileId = fileId;
            this.chatList[currentChatId].messages[findTempFileIdIndex].status =
              'sent';
          }
          if (!fileId) return;
          return sendMessage(information).then((result) => {
            const { uuid, id, guid } = result;
            this.updateIdMessage({
              chatId: uuid,
              id,
              guid,
            });
          });
        });
      });
    },
    sendForwardingData({
      type,
      text,
      chatId,
      title,
      textDirectionIsRtl,
      forwardedData,
    }) {
      if (type == 'text') {
        //// send message as text
        const information = {
          to: chatId, // it`s equal to userId
          id: idGenerator(),
          message: text,
          mtype: 'oto.txt',
          title: title,
          data: {
            ...forwardedData.fileData?.webChatData,
            ext_data: JSON.stringify(forwardedData.ext_data),
          },
        };
        this.addManuallyChatItemToChatList(
          information,
          chatId,
          textDirectionIsRtl,
          'text',
        );
        return sendMessage(information);
      }

      const additionalMessageInfo = detectFileTypeForSendingMessage(type);
      const { fileId, description, md5, name, size, dim, duration } =
        forwardedData.fileData;
      let information = {
        to: chatId, // its same userId (uuid)
        id: idGenerator(),
        message: additionalMessageInfo.notificationTitle,
        mtype: additionalMessageInfo.type, // oto.img || oto.vid || oto.aud || oto.doc
        title: title, // Nick Name of user that send message
        // for sending file as a message this property is needed
        data: {
          fileId,
          description,
          md5,
          name,
          size,
          type: forwardedData.fileData.type,
          dim,
          duration,
          ext_data: JSON.stringify(forwardedData.ext_data),
        },
        status: 'sending',
      };

      this.addManuallyChatItemToChatList(
        information,
        chatId,
        textDirectionIsRtl,
        type,
      );
      return sendMessage(information);
      /// send message as file or media
    },
    received(rtmData) {
      const currentChatId = this.currentChatId;
      const overallStore = useOverallChatsStore();
      overallStore.updateList(rtmData);
      if (
        rtmData.data.body === 'voipcall' ||
        rtmData.mtype === 'oto.mis' ||
        rtmData.data.mtype === 'oto.mis' ||
        (rtmData.mtype !== 'oto.cpy' && currentChatId !== rtmData.from) ||
        rtmData.mtype === 'oto.cst' ||
        (rtmData.mtype === 'oto.cpy' && rtmData.data.mtype === 'oto.mst')
      ) {
        return;
      }
      if (rtmData.mtype === 'oto.mst') {
        this.updateSeenMessagesStatus(rtmData);
        return;
      }
      this.updateStateOfMessage(rtmData);

      const information = generateDataModelMessage(
        rtmData,
        false,
        null,
        null,
        null,
        0,
      );
      const keyChat = rtmData.from;
      const messageId = rtmData.data.guid;
      const targetChat = this.chatList[keyChat];
      if (targetChat) {
        this.chatList[keyChat].messages.push(information);
        requestAnimationFrame(() => {
          if (this.scrollerElement && this.currentChatId) {
            this.scrollerElement.scrollToBottom();
            this.sendSeenRequestOfMessage(currentChatId, messageId);
          }
        });
        return;
      }
      this.chatList[keyChat] = { messages: [information] };
      if (this.currentChatId) {
        this.sendSeenRequestOfMessage(currentChatId, messageId);
      }
    },
    addManuallyChatItemToChatList(
      messageItem,
      chatId,
      textDirectionIsRtl = true,
      type = 'file',
    ) {
      const information = generateDataModelMessage(
        messageItem,
        true,
        textDirectionIsRtl,
        type,
        null,
        0,
      );
      const keyChat = chatId;
      const targetChat = this.chatList[keyChat];
      if (targetChat) {
        this.chatList[keyChat].messages.push(information);
      } else {
        this.chatList[keyChat] = { messages: [information] };
      }
      requestAnimationFrame(() => {
        if (this.scrollerElement) this.scrollerElement.scrollToBottom();
      });
    },
    removeMessage({ id, chatId }) {
      const information = {
        id,
        mtype: 'oto.del',
        title: title,
      };
      return sendMessage(information).then((result) => {
        // const targetMessageIndex = this.
      });
    },
    removeMessageLocally({ chatId, id }) {
      const findTargetMessageIndex = this.chatList[
        chatId
      ].messages.findLastIndex((e) => e?.id == id);
      if (findTargetMessageIndex != -1) {
        this.chatList[chatId].messages.splice(findTargetMessageIndex, 1);
      }
    },
    sendSeenRequestOfMessage(chatId, messageGuid) {
      const userStore = useUserStore();
      const userId = userStore.userId;
      if (chatId == userId) return;
      const information = {
        to: chatId, // it`s equal to userId
        id: idGenerator(),
        mtype: 'oto.mst',
        data: {
          stt: 5,
          guid: messageGuid,
        },
      };
      return sendMessage(information);
    },
    updateIdMessage({ chatId, guid, id }) {
      const findTargetMessageIndex = this.chatList[
        chatId
      ].messages.findLastIndex((e) => e?.id == id);
      if (findTargetMessageIndex != -1) {
        this.chatList[chatId].messages[findTargetMessageIndex].id = guid;
      }
    },
    updateStateOfMessage(messageData) {
      const targetChatId = messageData.data.to;
      const messageId = messageData.data.id;
      const messageGuid = messageData.data.guid;
      const targetChatList = this.chatList[targetChatId]?.messages;
      if (targetChatList) {
        setTimeout(() => {
          const targetMessage =
            targetChatList.find(
              (e) => e?.id == messageId || e?.id == messageGuid,
            ) || {};

          setTimeout(() => {
            targetMessage.status = 'sent';
          }, 100);
        }, 100);
      }
    },
    updateSeenMessagesStatus(messageData) {
      const userStore = useUserStore();
      if (messageData.from == userStore.userId) return;
      const targetChatId = this.currentChatId;
      if (!targetChatId || targetChatId == '') return;
      const chatList = this.chatList[targetChatId].messages;
      setTimeout(() => {
        const filtredList = chatList.filter((e) => e.status != 'seen');
        setTimeout(() => {
          filtredList.forEach((e) => {
            e.status = 'seen';
            this.sendSeenRequestOfMessage(
              targetChatId,
              e.additionalMessageInfo.guid,
            );
          });
        }, 100);
      }, 100);
    },
    setScrollerElement(scrollerElement) {
      this.scrollerElement = scrollerElement;
    },
  },
  persist: {
    paths: ['chatList', 'currentChatId'],
  },
});
