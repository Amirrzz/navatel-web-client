import { defineStore } from 'pinia';
import { getCallsHistory } from '@/api/cdr/index.js';
import { orderCallHistory } from '@/helpers/callHistoryParser.js';
import { useContactsStore } from '@/store/contacts/contacts.js';
import { useLocaleStore } from '@/store/locale.js';
import { useUserStore } from '@/store/user/user.js';
import { detectCallForRemovelist } from '@/helpers/parser.js';
import {
  dateFormatterHandler,
  convertToTime,
  dateFormatForCallHistory,
  convertSecoundToUsge,
} from '@/helpers/dateAndTimeFormatter.js';

export const useCdrStore = defineStore('CDRStore', {
  state: () => ({
    callsHistory: [],
    selectedCall: [],
    removeModalStatus: false,
    isSelected: false,
  }),
  getters: {
    getCallHistoryList(state) {
      const localeStore = useLocaleStore();
      const localeFormat = localeStore.getLocaleFormat;
      const contactStore = useContactsStore();
      const userStore = useUserStore();
      const selfPhoneNumber = userStore.phoneNumber;
      return state.callsHistory.map((item, index) => {
        const isOutgoingCall = item.caller == selfPhoneNumber;
        const targetNumber = isOutgoingCall ? item.destination : item.caller;
        const targetContact = contactStore.getUserInAllContacts(targetNumber);
        const targetName = targetContact?.name || targetNumber;
        return {
          id:
            item.id ||
            `${targetNumber}-index-call-history-${index}--${item.setup_time}`,
          isOutgoingCall,
          isMissedCall: item.usge == 0 ? true : false,
          caller: !isOutgoingCall
            ? contactStore.getUserInAllContacts(item.caller)
            : item.caller,
          reciver: isOutgoingCall
            ? contactStore.getUserInAllContacts(item.destination)
            : item.destination, // the curent user phone number,
          dateOfCall: dateFormatterHandler(item.setup_time, localeFormat, {
            isFromMessages: false,
            isFromCallHistory: true,
          }),
          targetName,
          targetNumber,
          destination: item.destination,
          duration: convertToTime(item.usge),
          type: item.call_type,
          firstChar: item.firstChar,
        };
      });
    },
  },
  actions: {
    getCallHistory() {
      const localStorageList = this.callsHistory.filter(
        (e) => e.call_type == 'free_call',
      );
      return getCallsHistory().then(async (result) => {
        const listData = localStorageList.concat(result);
        const orderedList = await orderCallHistory(listData);
        this.callsHistory = orderedList;
      });
    },
    async addToCallHistory(data) {
      const callType =
        data.callType === 'freeCall'
          ? 'free_call'
          : data.isIncoming
          ? 'enterprise_did'
          : 'enterprise_out';

      let { phoneNumber, name } = data.userInformation;
      if (!phoneNumber)
        phoneNumber = data?.session?._remote_identity?._uri?._user;
      const usersNumbers = data.isIncoming
        ? { caller: phoneNumber, destination: data.selfPhoneNumber }
        : { caller: data.selfPhoneNumber, destination: phoneNumber };
      const information = {
        call_type: callType,
        ...usersNumbers,
        id: `self-generate${data.callId}-${Math.random()}`,
        usge: convertSecoundToUsge(data.duration || 0),
        setup_time: dateFormatForCallHistory(),
        firstChar:
          data.callType === 'freeCall' && name ? `${name.slice(0, 2)}` : null,
      };
      this.callsHistory.unshift(information);
      const listData = this.callsHistory;
      const orderedList = await orderCallHistory(listData);
      this.callsHistory = orderedList;
    },
    addToSelectedCall(param) {
      const item = this.selectedCall.map((call) => call.id).includes(param.id);
      if (!item) {
        this.selectedCall.push(param);
      } else {
        this.selectedCall = this.selectedCall.filter(
          (item) => item.id != param.id,
        );
      }
    },
    async removeCallsFromHistory() {
      this.callsHistory = await detectCallForRemovelist(
        this.callsHistory,
        this.selectedCall,
      );
      this.selectedCall = [];
    },
  },
  persist: true,
});
