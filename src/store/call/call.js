import { defineStore } from 'pinia';
import { useUserStore } from '@/store/user/user.js';
import { initConnection } from '@/api/call/index.js';
import { useFileManagerStore } from '@/store/fileManager/fileManager.js';
import { useI18n } from 'vue-i18n';
import { getUserProfileByPhoneNumber, getUser } from '@/api/user/index.js';
import { setScreenWakeLock } from '@/helpers/browserApis.js';
import { useCdrStore } from '@/store/callHistory/callHistory.js';
import { call } from 'ionicons/icons';
import { useContactsStore } from '@/store/contacts/contacts.js';
const baseUrl = import.meta.env['VITE_APP_SIP_WEBSOCKET_URL'];
let userAgent;
const connections = {};
let connectionsInQueue = [];
let ringBackAudio;
export let ringtoneAudio;
let holdAudio;

export const useCallStore = defineStore('CallStore', {
  state: () => ({
    statusOfConnection: {
      isOutgoing: null,
      isIncoming: null,
      isInConversation: null,
      isReallyConnected: null,
      intentionalEnd: null,
      calltype: '',
      callState: null,
      targetUserInformation: {
        name: '',
        avatar: '',
        phoneNumber: '',
      },
    },
    showCallingModalRef: null,
    activeCallId: null,
    activeReferalCallId: null,
    arrayForTriggerGetter: [1],
  }),
  getters: {
    getCallModalStatus(state) {
      if (
        (state.activeCallId || state.activeReferalCallId) &&
        state.arrayForTriggerGetter.length
      ) {
        const lastActiveCallId =
          state.activeReferalCallId || state.activeCallId;
        const callObject = connections[lastActiveCallId];
        const userInformation = callObject?.userInformation || {};
        if (!userInformation.name || userInformation.forceDisplayName) {
          const { t } = useI18n();
          userInformation.name =
            userInformation.forceDisplayName || t('tabs.callpad.unknown');
        }
        if (callObject) {
          return {
            isOutgoing: callObject.isOutgoing,
            isIncoming: callObject.isIncoming,
            showModal: callObject.isOutgoing || callObject.isIncoming,
            showKeys: callObject.isOutgoing || callObject.isInConversation,
            calltype: callObject.callType,
            callState: callObject.callState,
            isInConversation: callObject.isInConversation,
            isReallyConnected: callObject.isReallyConnected,
            callId: callObject.callId,
            targetUserInformation: userInformation,
            isHold:
              callObject?.session?.isOnHold().local ||
              callObject?.session?.isOnHold().local,
            isMute: callObject?.session?.isMuted().audio,
            duration: callObject.duration,
          };
        }
        return { targetUserInformation: {} };
      }
      return { targetUserInformation: {} };
    },
  },
  actions: {
    register() {
      const userStore = useUserStore();
      const displayName = userStore.nickname || userStore.name;
      const userId = userStore.userId;
      const token = userStore.token;
      userAgent = initConnection(displayName, userId, token);
      /// set connection and registred automatically
      userAgent.start();
      ////// events for userAgent
      //// registration events
      userAgent.on('registered', ({ response }) => {});
      userAgent.on('unregistered', ({ response, cause }) => {});
      userAgent.on('registrationFailed', ({ response, cause }) => {});

      ////  connection events
      /// Fired for each transport connection attempt.
      userAgent.on('connecting', ({ socket, attempts }) => {
        console.log(
          `%cCall connecting =>${attempts}`,
          'color: #000000; background-color: #00cdcd; padding: 10px; border-radius: 5px;',
        );
      });
      /// Fired when the transport connection is established.
      userAgent.on('connected', ({ socket }) => {
        console.log('connected call socket');
      });
      /// Fired when the transport connection attempt (or automatic re-attempt) fails.
      userAgent.on('disconnected', ({ socket, error, code, reason }) => {
        console.log(
          `%cCall Disconnected =>${code}=>${reason}`,
          'color: #000000; background-color: #ffa500; padding: 10px; border-radius: 5px;',
        );
      });
      userAgent.on('unregistered', ({ response, cause }) => {
        console.log(
          `%cCall unregistered =>${cause}=>${response}`,
          'color: #000000; background-color: #ffa800; padding: 10px; border-radius: 5px;',
        );
      });

      ///// New incoming or outgoing call event
      //Fired for an incoming or outgoing session/call.
      userAgent.on('newRTCSession', ({ originator, session, request }) => {
        // Incoming sessions
        if (session.direction == 'incoming') {
          this.incommingCallHandler(session, request).then((callId) => {
            const targetSession = connections[callId].session;
            targetSession.on('peerconnection', this.peerconnectionBallHandler);
            targetSession.on('sending', this.sendingCallHandler);
            targetSession.on('connecting', this.connectingCallHandler);
            targetSession.on('connected', this.connectedCallHandler);
            targetSession.on('accepted', this.acceptedCallHandler);
            targetSession.on('progress', this.progressEventHandler);
            targetSession.on('reinvite', this.reinviteCallHandler);
            targetSession.on('update', this.updateCallHandler);
            targetSession.on('replaces', this.replacesCallHandler);
            targetSession.on('icecandidate', this.icecandidateCallHandler);
            targetSession.on('newInfo', this.newInfoCallHandler);
            targetSession.on('info', this.infoCallHandler);
            targetSession.on('started', this.startedCallHandler);
            targetSession.on('ended', this.endedEventHandler);
            targetSession.on('refer', this.referingCallHandler);
            targetSession.on('hold', this.holdEventHandler);
            targetSession.on('unHold', this.unholdEventHandler);
            targetSession.on('sdp', this.sdpEventHandler);
            targetSession.on('confirmed', this.confirmedEventHandler);
            targetSession.on('failed', this.failedEventHandler);
            targetSession.on('referSubscriber', (data) => {
              // Update UI or perform actions on successful call transfer to Session C
            });
          });
        }
        // Outgoing sessions
        if (session.direction == 'outgoing') {
          this.outgoingCallHandler(session, request).then((callId) => {
            const targetSession = connections[callId].session;
            targetSession.on('peerconnection', this.peerconnectionBallHandler);
            targetSession.on('sending', this.sendingCallHandler);
            targetSession.on('connecting', this.connectingCallHandler);
            targetSession.on('connected', this.connectedCallHandler);
            targetSession.on('accepted', this.acceptedCallHandler);
            targetSession.on('progress', this.progressEventHandler);
            targetSession.on('reinvite', this.reinviteCallHandler);
            targetSession.on('update', this.updateCallHandler);
            targetSession.on('replaces', this.replacesCallHandler);
            targetSession.on('icecandidate', this.icecandidateCallHandler);
            targetSession.on('newInfo', this.newInfoCallHandler);
            targetSession.on('info', this.infoCallHandler);
            targetSession.on('started', this.startedCallHandler);
            targetSession.on('ended', this.endedEventHandler);
            targetSession.on('refer', this.referingCallHandler);
            targetSession.on('hold', this.holdEventHandler);
            targetSession.on('unHold', this.unholdEventHandler);
            targetSession.on('sdp', this.sdpEventHandler);
            targetSession.on('confirmed', this.confirmedEventHandler);
            targetSession.on('failed', this.failedEventHandler);
            targetSession.on('referSubscriber', (data) => {
              // Update UI or perform actions on successful call transfer to Session C
            });
          });
        }
      });
    },
    // InComing Outgoing referal call back Handler
    incommingCallHandler(session, request) {
      try {
        const targetUser = session._remote_identity; // userid || phoneNumber
        const callId = request.call_id;
        const sessionRequestHeaders = session._request.headers;
        const userStore = useUserStore();
        const selfPhoneNumber = userStore.phoneNumber;
        this.getTargetUserProfile(targetUser, callId);
        const replaces = request.headers['Replaces'];
        const isRefer = request.headers['X-Referred-By'];

        if (replaces || isRefer) {
          connections[callId] = {
            session: session,
            userInformation: {
              name: targetUser._displayName || targetUser._uri._user,
              uri: targetUser._uri._user,
            },
            selfPhoneNumber: selfPhoneNumber,
            isInConversation: true,
            callState: 'enterpriseDid',
            isIncoming: true,
            callId: callId,
          };
          const xCallType = sessionRequestHeaders['X-Calltype'];
          // assign type of a call to it`s object
          connections[callId].callType =
            xCallType && xCallType[0] && xCallType[0].raw === 'enterprise_did'
              ? 'enterpriseDid'
              : 'freeCall';

          this.answerTheReferalCall(callId);
          return Promise.resolve(callId);
        }

        // assign a new session to connections object by CallId Key
        connections[callId] = {
          session: session,
          userInformation: {
            name: targetUser._displayName || targetUser._uri._user,
            uri: targetUser._uri._user,
          },
          selfPhoneNumber: selfPhoneNumber,

          callState: 'enterpriseDid',
          isIncoming: true,
          callId: callId,
        };

        // getting user Profile by userId or PhoneNumber
        // getting call request headers information
        // X-Calltype is array of object in header of request
        // we detect call type is free_call or etc
        const xCallType = sessionRequestHeaders['X-Calltype'];
        // assign type of a call to it`s object
        connections[callId].callType =
          xCallType && xCallType[0] && xCallType[0].raw === 'enterprise_did'
            ? 'enterpriseDid'
            : 'freeCall';
        if (this.activeCallId) {
          connectionsInQueue.push(connections[callId]);
        } else {
          this.activeCallId = callId;
          triggerRingtoneAudio(true);
        }

        return Promise.resolve(callId);
      } catch (error) {}
    },
    outgoingCallHandler(session, request) {
      const targetUser = session._remote_identity; //  ._user =>userid || phoneNumber
      const callId = request.call_id;
      const userStore = useUserStore();
      const selfPhoneNumber = userStore.phoneNumber;
      this.getTargetUserProfile(targetUser, callId);
      // assign a new session to connections object by CallId Key
      connections[callId] = {
        session: session,
        userInformation: {
          name: targetUser._displayName || targetUser._uri._user,
          uri: targetUser._uri._user,
        },
        isOutgoing: true,
        callState: 'ringing',
        callId: callId,
        selfPhoneNumber,
      };

      // getting call request headers information
      const sessionRequestExtraHeaders = session._request.extraHeaders;
      // X-Calltype is array of String in header of request
      // we detect call type is free_call or nava_out and etc

      connections[callId].callType = sessionRequestExtraHeaders.includes(
        'X-callType : nava_out',
      )
        ? 'navaOut'
        : 'freeCall';

      // Sometimes we want to transfer a user to another user
      // here we detect this outgoing session is for referal
      // referal-asking in here means user (A || B) sent data of user C and ( A || B ) sent a call to User C
      // A-B-C or B-A-C
      return Promise.resolve(callId);
    },
    referingCallHandler({ request }) {
      const referedBy = request.headers['Referred-By'][0].raw;
      const replaceHeader = decodeURIComponent(
        request?.refer_to?._uri?._headers?.Replaces[0],
      );

      const callType = request.headers['X-Calltype'][0].raw;
      const option = {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: [
          `X-callType : ${callType}`,
          `X-Referred-By: ${referedBy}`,
          `Referred-By: ${referedBy}`,
          `replaces: ${replaceHeader}`,
          `x-replaces: ${replaceHeader}`,
        ],
        sessionTimersExpires: 1800,
      };
      // Log or use the replacesValue as needed

      this.makeReferalCall(request.refer_to._uri._user, option);
    },

    /// making Call Actions

    // ui action Handler
    //this function detect phoneNumber that user enter in callpad tab is free_call Or Nava
    async makingCallHandler(phoneNumber) {
      const userStore = useUserStore();
      if (userStore.phoneNumber.includes(phoneNumber)) {
        return;
      }
      setScreenWakeLock(); // prevent scrren to be off after a while
      let callNumber =
        phoneNumber[0] == '0'
          ? '98' + phoneNumber.substring(1, phoneNumber.length)
          : phoneNumber;

      if (phoneNumber.endsWith('***')) {
        callNumber = callNumber.substring(0, callNumber.length - 3);
        triggerRingBackAudio(true);
        return this.makeFreeCall(callNumber);
      }
      triggerRingBackAudio(true);
      return this.makeNavaCall(callNumber);
    },
    // make free call
    async makeFreeCall(phoneNumber, isRefered) {
      const userStore = useUserStore();
      const token = userStore.token;
      const options = {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: ['X-callType : free_call', `X-Token: ${token}`],
        sessionTimersExpires: 1800,
      };
      const target = `sip:${phoneNumber}@${baseUrl}`;
      isRefered ? options.extraHeaders.push(['X-Refered: ' + token]) : '';
      const callId = await userAgent.call(target, options)._request.call_id;
      this.addStream(callId);
      this.activeCallId = callId;
      return callId;
    },
    // make a nava call it`s means the Sim Cart is target
    async makeNavaCall(phoneNumber) {
      const userStore = useUserStore();
      const token = userStore.token;
      const options = {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: ['X-callType : nava_out', `X-Token: ${token}`],
        sessionTimersExpires: 1800,
      };
      const target = `sip:${phoneNumber}@${baseUrl}`;
      const callId = await userAgent.call(target, options)._request.call_id;
      this.addStream(callId);
      this.activeCallId = callId;
      return callId;
    },
    // here is step one of transfer
    // this function invoke in ui component by selecting a contacts during a call or enter a number
    async makingCallByAnotherUserForAskingTransfer(phoneNumber, type) {
      const userStore = useUserStore();
      const token = userStore.token;
      if (userStore.phoneNumber.includes(phoneNumber)) {
        return;
      }
      let callType = type;
      const options = {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: [`X-callType : ${callType}`, `X-Token: ${token}`],
        sessionTimersExpires: 1800,
      };
      const target = `sip:${phoneNumber}@${baseUrl}`;
      const callId = await userAgent.call(target, options)._request.call_id;
      this.activeReferalCallId = callId;
      connections[callId].transformCallType = callType;
      this.addStream(callId);
      return callId;
    },
    async makeReferalCall(phoneNumber, options) {
      const userStore = useUserStore();
      const token = userStore.token;
      const target = `sip:${phoneNumber}@${baseUrl}`;
      options.extraHeaders.push(`X-Token: ${token}`);
      const callId = await userAgent.call(target, options)._request.call_id;
      this.endingCallHandler(this.activeCallId);
      this.activeCallId = callId;
      this.addStream(callId);
      this.resetDuration(this.activeCallId, callId);
      this.arrayForTriggerGetter.push({});
      return callId;
    },
    // answer actions
    answerTheCall(sessionId) {
      const userStore = useUserStore();
      const token = userStore.token;
      const connection = connections[sessionId];
      const options = {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: [`X-Token: ${token}`],
        sessionTimersExpires: 1800,
      };
      connection.session.answer(options);
      connection.isInConversation = true;
      this.arrayForTriggerGetter.push({});
      triggerRingtoneAudio(false);
      this.addStream(sessionId);
      this.startDuration(sessionId);
    },
    async answerTheReferalCall(sessionId) {
      const userStore = useUserStore();
      connections[sessionId].isInConversation = true;
      const token = userStore.token;
      const session = connections[sessionId].session;
      const options = {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: [`X-Token: ${token}`],
        sessionTimersExpires: 1800,
      };
      session.answer(options);
      triggerRingtoneAudio(false);
      this.arrayForTriggerGetter.push({});
      this.resetDuration(this.activeCallId, sessionId);
      this.activeCallId = sessionId;
      this.addStream(sessionId);
    },

    handlerReferTheCall(phoneNumber) {
      const connectionA = connections[this.activeCallId];
      const connectionB = connections[this.activeReferalCallId];
      if (connectionA.callType == 'navaOut') {
        this.chnageTargetReferDistionitonTheCall(connectionA, connectionB);
        return;
      }
      const target = `sip:${phoneNumber}@${baseUrl}`;
      this.handlerReferTheCallType(
        connectionA.callType,
        connectionB.callType,
      ).then((callType) => {
        this.referTheCall(
          connectionA.session,
          connectionB.session,
          callType,
          target,
        );
        this.reseterStatesAfterTheReferCall(connectionA, connectionB);
      });
    },
    chnageTargetReferDistionitonTheCall(connectionA, connectionB) {
      const phoneNumber = connectionA.userInformation.phoneNumber;
      const target = `sip:${phoneNumber}@${baseUrl}`;
      this.referTheCall(
        connectionB.session,
        connectionA.session,
        'nava_out',
        target,
      );
      this.reseterStatesAfterTheReferCall(connectionA, connectionB);
    },
    handlerReferTheCallType(callTypeA, callTypeB) {
      return new Promise((resolve, reject) => {
        if (callTypeA == 'navaOut' || callTypeB == 'navaOut') {
          resolve('nava_out');
          return;
        }
        if (callTypeA == 'enterpriseDid') {
          resolve('enterprise_did');
          return;
        }
        resolve('free_call');
      });
    },
    referTheCall(transferSession, destinationSession, callType, sipAddress) {
      const userStore = useUserStore();
      const token = userStore.token;
      const xReferedBy = transferSession._local_identity._uri._user;
      const extraHeaders = [
        `X-callType : ${callType}`,
        `X-Token: ${token}`,
        `X-Referred-By: ${xReferedBy}`,
      ];
      transferSession.refer(sipAddress, {
        mediaConstraints: { audio: true, video: false },
        extraHeaders: extraHeaders,
        replaces: destinationSession,
        sessionTimersExpires: 1800,
      });
    },
    reseterStatesAfterTheReferCall(connectionA, connectionB) {
      setTimeout(() => {
        removeAudioTagFromDOM(connectionA.callId);
        removeAudioTagFromDOM(connectionB.callId);
        connectionA.isOutgoing = null;
        connectionA.isIncoming = null;
        connectionB.isOutgoing = null;
        connectionB.isIncoming = null;
        setTimeout(() => {
          if (connectionA.callType != 'freeCall') {
            this.endingCallHandler(connectionA.callId);
            this.endingCallHandler(connectionB.callId);
          }
        }, 1000);
      }, 0);
    },
    checkConnectionIsInQueue() {
      const connectionInQueue = connectionsInQueue[0];
      if (connectionInQueue) {
        connections[connectionInQueue.callId] = connectionInQueue;
        this.activeCallId = connectionInQueue.callId;
        triggerRingtoneAudio(true);
        connectionsInQueue.splice(0, 1);
        this.arrayForTriggerGetter.push({});
        return;
      }
      this.activeCallId = null;
    },
    /// End the call Actions
    // here detect call is where of a call by status
    endingCallHandler(sessionId) {
      const connection = connections[sessionId];
      if (!connection) {
        this.activeCallId = null;
        this.activeReferalCallId = null;
        forceRemoveAllAudioTags();
        setScreenWakeLock(false); // if set false its mean its dosen matterscrren be off
        return;
      }
      this.stopDuration(sessionId);
      if ([2, 9].includes(connection.session?.status)) {
        this.endTheCall(sessionId);
        connection.isOutgoing = null;
        connection.isIncoming = null;
        this.arrayForTriggerGetter.push({});
        if (
          !this.activeReferalCallId ||
          (!this.activeCallId && sessionId == this.activeReferalCallId)
        ) {
          setScreenWakeLock(false); // if set false its mean its dosen matterscrren be off
        }
        return;
      }
      if ([4, 6].includes(connection.session?.status)) {
        connection.isOutgoing = null;
        connection.isIncoming = null;
        this.arrayForTriggerGetter.push({});
        this.rejectTheCall(sessionId);
        if (
          !this.activeReferalCallId ||
          (!this.activeCallId && sessionId == this.activeReferalCallId)
        ) {
          setScreenWakeLock(false); // if set false its mean its dosen matterscrren be off
        }
      }
      connection.isOutgoing = null;
      connection.isIncoming = null;
      this.arrayForTriggerGetter.push({});
      removeAudioTagFromDOM(sessionId);
      triggerRingBackAudio(false);
      triggerRingtoneAudio(false);
    },
    endTheCall(sessionId) {
      const connection = connections[sessionId];
      if (!connection) {
        if (this.activeReferalCallId) {
          this.activeReferalCallId = null;
        }
        if (this.activeCallId) {
          this.checkConnectionIsInQueue();
        }
      }
      const cdrStore = useCdrStore();
      cdrStore.addToCallHistory(connection);
      connection.session.terminate();
      removeAudioTagFromDOM(sessionId);
      if (this.activeReferalCallId == sessionId) {
        this.activeReferalCallId = null;
        return;
      }
      if (this.activeCallId == sessionId) {
        this.checkConnectionIsInQueue();
      }
    },
    rejectTheCall(sessionId) {
      const connection = connections[sessionId];
      const optionReject = {
        status_code: 603,
        reason_phrase: 'Decline',
      };
      const cdrStore = useCdrStore();
      cdrStore.addToCallHistory(connection);
      connection.session.terminate(optionReject);
      removeAudioTagFromDOM(sessionId);
      triggerRingtoneAudio(false);
      triggerRingBackAudio(false);
      if (this.activeReferalCallId == sessionId) {
        this.activeReferalCallId = null;
        return;
      }
      if (this.activeCallId == sessionId) {
        this.checkConnectionIsInQueue();
      }
    },
    sendDTMF(sessionId, number) {
      const connection = connections[sessionId];
      const options = {
        transportType: 'RFC2833',
      };
      if (connection.dtmfHistory) {
        const tone = number - connection.dtmfHistory * 10;
        connection.dtmfHistory = number;
        connection.session.sendDTMF(tone, options);
      } else {
        connection.session.sendDTMF(number, options);
        connection.dtmfHistory = number;
      }
    },
    startDuration(sessionId) {
      const connection = connections[sessionId];
      if (connection.interval) {
        clearInterval(connection.interval);
      }
      connection.duration = 0;
      connection.interval = setInterval(() => {
        connection.duration += 1000;
        this.arrayForTriggerGetter.push({});
        if (this.arrayForTriggerGetter.length > 30) {
          this.arrayForTriggerGetter = [{}];
        }
      }, 1000);
    },
    stopDuration(sessionId) {
      const connection = connections[sessionId];
      clearInterval(connection.interval);
      this.arrayForTriggerGetter.push({});
      this.arrayForTriggerGetter = [{}];
    },
    resetDuration(stopId, startId) {
      this.stopDuration(stopId);
      setTimeout(() => {
        this.startDuration(startId);
      }, 0);
    },
    getConnectionObject(sessionId) {
      return connections[sessionId];
    },
    async addStream(sessionId) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      const connection = connections[sessionId];
      if (!connection) {
        return;
      }
      connection.session.connection.addEventListener('track', function (e) {
        createAudioTagAndSetStream(sessionId, e.streams[0]);
      });
    },

    speakerOn(activeSessionId) {
      triggerSpeackerHandler(activeSessionId, true);
    },
    speakerOff(activeSessionId) {
      triggerSpeackerHandler(activeSessionId, false);
    },

    holdTheCall(activeSessionId) {
      const connection = connections[activeSessionId];
      if (connection && connection.session) {
        connection.session.hold();
        connection.callState = 'hold';
        this.arrayForTriggerGetter.push({});
      }
    },
    unholdTheCall(activeSessionId) {
      const connection = connections[activeSessionId];
      if (connection && connection.session) {
        connection.session.unhold();
        connection.callState = 'inConversation';

        this.arrayForTriggerGetter.push({});
      }
    },
    muteTheCall(activeSessionId) {
      const connection = connections[activeSessionId];
      if (connection && connection.session) {
        connection.session.mute();
        this.arrayForTriggerGetter.push({});
      }
    },
    unmuteTheCall(activeSessionId) {
      const connection = connections[activeSessionId];
      if (connection && connection.session) {
        connection.session.unmute();
        this.arrayForTriggerGetter.push({});
      }
    },

    setAudioTag(
      ringBackAudioElement,
      ringtoneAudioElement,
      holdAudioElement,
      showCallingModalRef,
    ) {
      ringBackAudio = ringBackAudioElement;
      ringtoneAudio = ringtoneAudioElement;
      holdAudio = holdAudioElement;
      this.showCallingModalRef = showCallingModalRef;
    },
    getTargetUserProfile(targetUser, callId) {
      const searchValue = targetUser._uri?._user
        ? targetUser._uri._user
        : targetUser;
      if (/^[a-z,0-9,-]{36,36}$/.test(searchValue)) {
        const contactStore = useContactsStore();
        const result = contactStore.getUserInNavaphoneContacts(searchValue);
        if (result) {
          setTimeout(() => {
            this.setTargetUserProfile(result, targetUser, callId);
          });
          return;
        }
        getUser(searchValue).then((result) => {
          this.setTargetUserProfile(result, targetUser, callId);
        });
      } else {
        const contactStore = useContactsStore();
        const result = contactStore.getUserInNavaphoneContacts(searchValue);
        if (result) {
          setTimeout(() => {
            this.setTargetUserProfile(result, targetUser, callId);
          }, 0);
          return;
        }
        getUserProfileByPhoneNumber(searchValue).then((result) => {
          this.setTargetUserProfile(result, targetUser, callId);
        });
      }
    },
    async setTargetUserProfile(information, target, callId) {
      try {
        let renderingInfo = {
          name: information.name || information.nickname || target._displayName,
          phoneNumber: information.contact_phone || information.phone_number,
          avatar: null,
        };
        if (information.avatar) {
          const fileId = information.avatar.split('.');
          const fileIdResult = fileId[0] ? fileId[0] : information.avatar;
          const fileManagerStore = useFileManagerStore();
          fileManagerStore.gettingAvatarsHandler(fileIdResult, false);
          renderingInfo.avatar = fileIdResult;
          connections[callId].userInformation = renderingInfo;
          this.arrayForTriggerGetter.push({});
          return;
        }
        connections[callId].userInformation = renderingInfo;
        this.arrayForTriggerGetter.push({});
      } catch (error) {
        console.log(error, 'error');
      }
    },
    //////////////////////
    peerconnectionBallHandler(event) {},
    sendingCallHandler(event) {},
    connectingCallHandler(event) {},
    connectedCallHandler(event) {},
    acceptedCallHandler(event) {},
    reinviteCallHandler(event) {
      const callId = event.request.call_id;
      if (this.activeReferalCallId == callId) {
        const connection = connections[callId];
        const callIsHold = connections[callId]?.session?.isOnHold();
        if (callIsHold.remote) {
          connection.callState = 'inConversation';
          triggerHoldAudio(false);
        } else {
          connection.callState = 'hold';
          triggerHoldAudio(true);
        }
        return;
      } else if (this.activeCallId == callId) {
        const connection = connections[callId];
        const callIsHold = connections[callId]?.session?.isOnHold();
        if (callIsHold.remote) {
          connection.callState = 'inConversation';
          triggerHoldAudio(false);
          this.arrayForTriggerGetter.push({});
        } else {
          connection.callState = 'hold';
          triggerHoldAudio(true);
          this.arrayForTriggerGetter.push({});
        }
      }
    },
    updateCallHandler(event) {},
    replacesCallHandler(event) {
      event.accept(this.onNewSession);
    },
    onNewSession(newSession) {},
    icecandidateCallHandler(event) {
      if (event.candidate) {
        event.ready(event.candidate);
      }
    },
    newInfoCallHandler(event) {},
    infoCallHandler(event) {},
    startedCallHandler(event) {},
    progressEventHandler(event) {},
    sdpEventHandler(event) {},
    confirmedEventHandler(event) {
      try {
        const connection =
          connections[this.activeCallId || this.activeReferalCallId];
        connection.isInConversation = true;
        connection.callState = 'inConversation';
        connection.isReallyConnected = true;
        this.arrayForTriggerGetter.push({});
        triggerRingBackAudio(false);
        triggerRingtoneAudio(false);
      } catch (e) {}
    },
    holdEventHandler(event) {},
    unholdEventHandler(event) {},
    endedEventHandler(event) {
      if (event.originator == 'remote' && event.cause == 'Terminated') {
        const callId = event.message.call_id;
        this.stopDuration(callId);
        const cdrStore = useCdrStore();
        cdrStore.addToCallHistory(this.getConnectionObject(callId));
        if (this.activeReferalCallId == callId) {
          removeAudioTagFromDOM(callId);
          connections[callId].isOutgoing = null;
          connections[callId].isIncoming = null;
          this.arrayForTriggerGetter.push({});
          delete connections[callId];

          this.activeReferalCallId = null;
          if (
            !this.activeReferalCallId ||
            (!this.activeCallId && callId == this.activeReferalCallId)
          ) {
            setScreenWakeLock(false); // if set false its mean its dosen matterscrren be off
          }
          return;
        } else if (this.activeCallId == callId) {
          this.checkConnectionIsInQueue();
          connections[callId].isOutgoing = null;
          connections[callId].isIncoming = null;
          this.arrayForTriggerGetter.push({});
          delete connections[callId];
          triggerRingtoneAudio(false);
          triggerRingBackAudio(false);
          removeAudioTagFromDOM(callId);
          if (
            !this.activeReferalCallId ||
            (!this.activeCallId && callId == this.activeReferalCallId)
          ) {
            setScreenWakeLock(false); // if set false its mean its dosen matterscrren be off
          }
        }
      }
      triggerHoldAudio(false);
    },
    failedEventHandler(event) {
      if (
        event.originator == 'remote' &&
        [
          'Canceled',
          'Rejected',
          'Unavailable',
          'Authentication Error',
          'SIP Failure Code',
          'Not Found',
          'Forbidden',
        ].includes(event.cause)
      ) {
        const callId = event.message.call_id;
        const cdrStore = useCdrStore();
        cdrStore.addToCallHistory(this.getConnectionObject(callId));
        this.stopDuration(callId);
        const connectionInQueue = connectionsInQueue.find(
          (connection) => connection.callId == callId,
        );
        removeAudioTagFromDOM(callId);
        if (this.activeReferalCallId == callId) {
          removeAudioTagFromDOM(callId);
          connections[callId].isOutgoing = null;
          connections[callId].isIncoming = null;
          this.arrayForTriggerGetter.push({});
          delete connections[callId];
          this.activeReferalCallId = null;
          triggerRingtoneAudio(false);
          triggerRingBackAudio(false);
          if (
            !this.activeReferalCallId ||
            (!this.activeCallId && sessionId == this.activeReferalCallId)
          ) {
            setScreenWakeLock(false); // if set false its mean its dosen matterscrren be off
          }
          return;
        } else if (this.activeCallId == callId) {
          this.checkConnectionIsInQueue();
          connections[callId].isOutgoing = null;
          connections[callId].isIncoming = null;
          this.arrayForTriggerGetter.push({});
          delete connections[callId];
          triggerRingtoneAudio(false);
          triggerRingBackAudio(false);
          if (
            !this.activeReferalCallId ||
            (!this.activeCallId && sessionId == this.activeReferalCallId)
          ) {
            setScreenWakeLock(false); // if set false its mean its dosen matter scrren be off
          }
        } else if (connectionInQueue) {
          const connectionInQueueIndex = connectionsInQueue.findIndex(
            (connection) => connection.callId == connectionInQueue.callId,
          );
          connectionsInQueue.splice(connectionInQueueIndex, 1);
        } else if (connectionsInQueue[0]) {
          this.checkConnectionIsInQueue();
        }
      }
    },
  },
  persist: false,
});

export function triggerRingtoneAudio(setPlay = true) {
  ringtoneAudio.currentTime = 0;
  if (setPlay) {
    if (ringtoneAudio.paused) {
      ringtoneAudio.play();
    }
    return;
  }
  if (!ringtoneAudio.paused) {
    ringtoneAudio.pause();
  }
}

export function triggerRingBackAudio(setPlay = true) {
  ringBackAudio.currentTime = 0;
  if (setPlay) {
    if (ringBackAudio.paused) {
      ringBackAudio.play();
    }
    return;
  }
  if (!ringBackAudio.paused) {
    ringBackAudio.pause();
  }
}
function triggerHoldAudio(setPlay = true) {
  holdAudio.currentTime = 0;
  if (setPlay) {
    if (holdAudio.paused) {
      holdAudio.play();
    }
    return;
  }
  if (!holdAudio.paused) {
    holdAudio.pause();
  }
}

function createAudioTagAndSetStream(callId, stream) {
  const audioTagElement = document.createElement('audio');
  audioTagElement.setAttribute('loop', '');
  audioTagElement.setAttribute('preload', 'auto');
  audioTagElement.setAttribute('id', 'voice-audio-element' + callId);
  audioTagElement.setAttribute('class', 'voice-audio-element');
  audioTagElement.volume = 0.1;
  audioTagElement.srcObject = stream;
  document.body.appendChild(audioTagElement);
  setTimeout(() => {
    audioTagElement.play();
  }, 0);
}
function removeAudioTagFromDOM(callId) {
  founderAudioTagElement(callId)
    .then((audioTagElement) => {
      audioTagElement.remove();
    })
    .catch((e) => {});
}
function forceRemoveAllAudioTags() {
  const audiotags = document.body.querySelectorAll('.voice-audio-element');
  audiotags.forEach((element) => {
    element.remove();
  });
}

function triggerSpeackerHandler(callId, isOn) {
  founderAudioTagElement(callId)
    .then((audioTagElement) => {
      if (isOn) {
        audioTagElement.volume = 1;
        return;
      }
      audioTagElement.volume = 0.1;
    })
    .catch((e) => {});
}
// id is equal to callID
function founderAudioTagElement(id) {
  return new Promise((resolve, reject) => {
    let audioTagElement = document.getElementById('voice-audio-element' + id);
    if (audioTagElement) {
      resolve(audioTagElement);
    } else {
      let tryCounter = 0;
      const interval = setInterval(() => {
        if (audioTagElement || tryCounter > 4) {
          if (audioTagElement) {
            resolve(audioTagElement);
          } else
            reject(
              `Audio Tag Element by this id (voice-audio-element${id}) Not exist; ${tryCounter} try to access to it`,
            );
          clearInterval(interval);
        }
        audioTagElement = document.getElementById('voice-audio-element' + id);
        tryCounter++;
      }, 500);
    }
  });
}
