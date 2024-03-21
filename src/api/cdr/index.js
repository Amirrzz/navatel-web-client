import axios from './axiosConfig';

export const getCallsHistory = () => {
  return axios.post().then((response) => {
    return response?.data || [];
  });
};
