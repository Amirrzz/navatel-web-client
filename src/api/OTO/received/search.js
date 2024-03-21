import axios from "./axiosSearchConfig";

export const searchByDate = (chatId, date) => {
  // chatId is an id that you want do searing on it`s messages
  // date is a timestamp => 1692016850411
  return axios.get(`/calender/oto/${chatId}/${date}`);
};

export const searchByText = (chatId, text) => {
  // chatId is an id that you want do searing on it`s messages
  // text is search Value
  return axios.post(`/find/oto/${chatId}`, {
    targetString: text,
  });
};
export const getPreviouslySearchByText = (chatId, targetMessageId, text) => {
  // chatId is an id that you want do searing on it`s messages
  // targetMessageId is an id that you want doing search before it and itself
  // text is search Value
  return axios.post(`/find/prev/oto/${chatId}/${targetMessageId}`, {
    targetString: text,
  });
};

export const getNextSearchByText = (chatId, targetMessageId, text) => {
  // chatId is an id that you want do searing on it`s messages
  // targetMessageId is an id that you want doing search after it and itself
  // text is search Value
  return axios.post(`/find/next/oto/${chatId}/${targetMessageId}`, {
    targetString: text,
  });
};
