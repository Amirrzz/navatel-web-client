import axios from './axiosConfig';
import { initSet } from '@/api/initset/index.js';
/**
 * Result is an object of user information
 * @param {String} userId The User`s uuid
 * @param {String} sessionToken The User`s sessionToken
 */
export const getUser = (userId) => {
  return axios.post('/get-profile/' + userId).then((response) => {
    return response.data;
  });
};
export const getUserProfileByPhoneNumber = (phoneNumber) => {
  return axios.get('/map/phone-number/' + phoneNumber).then((res) => {
    if (res.data.uuid) {
      return getUser(res.data.uuid);
    }
  });
};
export const getUserIdPhoneNumber = (phoneNumber) => {
  return axios.get('/map/phone-number/' + phoneNumber).then((res) => {
    if (res.data.uuid) {
      return res.data.uuid;
    }
  });
};
/**
 * Result is an Arrau of users information
 * @param {Array} userIds Array of userIds
 * @param {String} sessionToken The current User`s sessionToken
 */
export const getUsers = (userIds, sessionToken) => {
  return axios
    .post('/get-profiles/', {
      session_token: sessionToken,
      uuid: userIds,
    })
    .then((response) => {
      return response.data?.result;
    });
};

export const updateUser = (data) => {
  return initSet().then((result) => {
    return axios.post('/set-profile/', {
      ...data,
      flow_id: result,
    });
  });
};
