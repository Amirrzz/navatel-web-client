import axios from './axiosConfig';

export const getBalance = async (phoneNumber) => {
  return await axios.get('/balance/nava.sgas.ir/' + phoneNumber);
};

export const peyment = async (phoneNumber, amount) => {
  return await axios.post('/wallet/request/payment', {
    phone: phoneNumber,
    amount: amount,
    action: 'ACTION_PAYMENT',
    type: 'Navatel',
    platform: 'web',
  });
};
