import { defineStore } from 'pinia';
import { connector } from '@/api/rtm/index.js';
import { useUserStore } from '@/store/user/user.js';
import { useOtoStore } from '@/store/chats/otoChat.js';
import { useGroupChat } from '@/store/chats/groupChat.js';
import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useVideoCallStore } from '@/store/videoCall/videoCall.js';
import { receivedMessageHandler } from '@/helpers/grpParser.js';
import { useWebSocket } from '@vueuse/core';

export const useRTMStore = defineStore('RTMStore', {
  state: () => ({
    websokectInstance: null,
    tryToConnect: 0,
  }),
  actions: {
    connect() {
      this.tryToConnect++;
      const userStore = useUserStore();
      const webSocketUrl = connector(userStore.token);
      const { status, data, close } = useWebSocket(webSocketUrl, {
        onMessage: recivedMessageHandler,
        onConnected: this.onConnected,
        onError: this.onError,
        onDisconnected: this.onDisconnect,
        autoReconnect: {
          retries: 3,
          delay: 60000,
          onFailed() {
            console.log('Failed to connect WebSocket after 3 retries');
          },
        },
        heartbeat: {
          message: 'ping',
          interval: 60000,
          pongTimeout: 10000,
        },
      });
      //Recived Data
    },
    onDisconnected(webSocket, event) {
      // console.log('on disconnect');
    },
    onConnected(webSocket, event) {
      // console.log('on connected');
    },
    onError(webSocket, event) {
      console.log(
        `%cRTM disconnected (onerror event)`,
        'color: #ffffff; background-color: #e04055; padding: 8px; border-radius: 4px;',
      );
      if (this.tryToConnect > 20) return;
      setTimeout(() => {
        this.connect();
      }, 3000);
    },
    disconnect() {
      if (this.websokectInstance) {
        this.websokectInstance.close(4444, 'finished');
      }
    },
  },
  persist: false,
});
function recivedMessageHandler(webSocket, event) {
  const messageData = JSON.parse(event.data);
  window.parent.postMessage(messageData, '*');
  if (messageData.mtype.startsWith('oto')) {
    const otoStore = useOtoStore();
    otoStore.received(messageData);
  } else if (messageData.mtype.startsWith('grp')) {
    grpHandler(event);
  } else if (
    messageData.mtype === 'call' &&
    messageData.data.body === 'groupcall'
  ) {
    const videoCallStore = useVideoCallStore();
    videoCallStore.gettingVideoCall(messageData);
  }
}

const grpHandler = async (event) => {
  const osWidth = window.screen.width;
  const userStore = useUserStore();
  const overallChatsStore = useOverallChatsStore();
  const groupChatStore = useGroupChat();
  const responseFromSocket = JSON.parse(event.data);
  let itsMeFlag = null;
  if (userStore.userId == responseFromSocket.from) {
    itsMeFlag = true;
  } else {
    itsMeFlag = false;
  }

  if (responseFromSocket.mtype.startsWith('grp')) {
    if (osWidth > 600) {
      if (groupChatStore.inGroupChatRoomDesktop) {
        if (groupChatStore.currentGroup.group_id == responseFromSocket.to) {
          await receivedMessageHandler(responseFromSocket, itsMeFlag);
          await overallChatsStore.updateListFromGroupData(responseFromSocket);
        } else {
          await overallChatsStore.updateListFromGroupData(responseFromSocket);
        }
      } else {
        await overallChatsStore.updateListFromGroupData(responseFromSocket);
      }
    } else {
      // ** in forword from current group ** //
      if (responseFromSocket.data.ext_data) {
        if (responseFromSocket.data.ext_data.forwardFromId) {
          await overallChatsStore.updateListFromGroupData(responseFromSocket);
        }
      }
      if (groupChatStore.inGroupChatRoom) {
        if (groupChatStore.currentGroup.group_id == responseFromSocket.to) {
          await receivedMessageHandler(responseFromSocket, itsMeFlag);
        }
      } else {
        await overallChatsStore.updateListFromGroupData(responseFromSocket);
      }
    }
  }
};
