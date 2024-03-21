import axios from './axiosConfig';
export const sendMessage = (information) => {
  return axios.post('/send', information).then((response) => response.data);
};

export const getBlockedUserList = () => {
  // return a list that current user block them
  return axios.get(`/blocked`);
};

export const addToBlockList = (users) => {
  // users is a list that include userId
  // If want to block a user or many user you should use this api
  return axios.post(`/blocked`, users);
};

export const removeFromBlockList = (users) => {
  // users is a list that include userId
  // If want to remove a user or many user  from block list you should use this api
  return axios.post(`/blocked`, users);
};

export const getMutedUserList = () => {
  // return a list that current user Mute them
  return axios.get(`/muted`);
};

export const addToMuteList = (users) => {
  // users is a list that include userId
  // If want to Mute a user or many user you should use this api
  return axios.post(`/muted`, users);
};

export const removeFromMuteList = (users) => {
  // users is a list that include userId
  // If want to remove a user or many user  from Mute list you should use this api
  return axios.post(`/muted`, users);
};
