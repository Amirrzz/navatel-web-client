import axios from './axiosConfig';

export const getStatus = (userId) => {
  return axios.get('/get/' + userId).then((response) => {
    return response?.data;
  });
};

export const setStatus = (data) => {
  return axios.post('/', data);
};
