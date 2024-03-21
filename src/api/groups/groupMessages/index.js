import axios from './axiosConfig';

export const loadCurrentGroupMessage = (groupId, messagesCount) => {
  return axios.get(`grp/last/${groupId}/${messagesCount}`).then((response) => {
    return response;
  });
};

export const loadPreviouslyMessages = (
  groupId,
  targetMessageId,
  messagesCount,
) => {
  return axios
    .get(`/grp/beforeguid/${groupId}/${targetMessageId}/${messagesCount}`)
    .then((response) => {
      return response;
    });
};

export const getFirstMessage = (groupId, count) => {
  return axios
    .get(`/grp/first/${groupId}/${count}`)
    .then((response) => response);
};
