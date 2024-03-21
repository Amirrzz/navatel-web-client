import axios from './axiosConfig';

export const initSet = () => {
  return axios.post('/init-set/').then((result) => result.data.flow_id);
};
