import axios from './axiosConfig';

export const getChatRoomList = () => {
  // get inputbox List messages
  // only for OTO entity
  return axios.get('/dialog/-1').then((res) => res?.data?.otoconversation);
};
export const getMissedCalls = (chatId) => {
  // get miss call List from user
  // only for OTO entity
  return axios.get(`/oto/call/missedcalls/${chatId}`);
};

export const getPreviouslyMessages = (chatId, targetMessageId, counts) => {
  // chatId is an id that you want get it`s messages
  // targetMessageId is an id that you want get messages before it
  // how many message you want to get ? define that by counts
  return axios
    .get(`/oto/beforeguid/${chatId}/${targetMessageId}/${counts}`)
    .then((response) => {
      return response?.data?.messages || [];
    });
};

export const getTargetMessage = (chatId, targetMessageId) => {
  // chatId is an id that you want get it`s messages
  // targetMessageId is an id that you want get messages before it
  // how many message you want to get ? define that by counts
  return axios
    .get(`/oto/single/${chatId}/${targetMessageId}`)
    .then((response) => {
      return response?.data || {};
    });
};

export const getNextMessages = (chatId, targetMessageId, counts) => {
  // chatId is an id that you want get it`s messages
  // targetMessageId is an id that you want get messages after it
  // how many message you want to get ? define that by counts
  return axios
    .get(`/oto/afterguid/${chatId}/${targetMessageId}/${counts}`)
    .then((response) => {
      return response?.data?.messages || [];
    });
};

export const getFirstMessage = (chatId, counts) => {
  // chatId is an id that you want get it`s messages
  // how many message you want to get after the first message ? define that by counts
  return axios
    .get(`/oto/first/${chatId}/${counts}`)
    .then((response) => response?.data?.messages || []);
};

export const getLastMessage = (chatId, counts) => {
  // chatId is an id that you want get it`s messages
  // how many message you want to get before last  message ? define that by counts
  return axios.get(`/oto/last/${chatId}/${counts}`).then((response) => {
    return response?.data.messages || [];
  });
};

export const getPreviouslyEditedMessages = (
  chatId,
  targetMessageId,
  counts,
) => {
  // chatId is an id that you want get it`s messages
  // targetMessageId is an id that you want get edited messages before it
  // how many message you want to get edited messaged  ? define that by counts
  return axios.get(
    `/oto/Modifications/beforeguid/${chatId}/${targetMessageId}/${counts}`,
  );
};

export const getNextEditedMessages = (chatId, targetMessageId, counts) => {
  // chatId is an id that you want get it`s messages
  // targetMessageId is an id that you want get edited messages before it
  // how many message you want to get before last first message ? define that by counts
  return axios.get(
    `/oto/Modifications/afterguid/${chatId}/${targetMessageId}/${counts}`,
  );
};

export const clearMessages = (chatId, targetMessageId) => {
  // chatId is an id that you want get it`s messages
  // targetMessageId is an id that you want delete all messages before it
  return axios.get(`/oto/setdelete/${chatId}/${targetMessageId}`);
};
