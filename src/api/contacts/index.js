import axios from './axiosConfig';

export const getContacts = (userId) => {
  return axios
    .post('/list', {
      username: userId,
    })
    .then((response) => {
      return response?.data?.friends;
    });
};

export const addContact = (contactData) => {
  return axios
    .post('/add', {
      contact_phone: contactData.fullNumber,
      name: contactData.fullName,
      username: contactData.userId,
    })
    .then((response) => {
      return response?.data?.friend;
    });
};

export const editContact = (contactData) => {
  return axios
    .post('/add', {
      contact_phone: contactData.fullNumber,
      name: contactData.fullName,
      username: contactData.userId,
    })
    .then((response) => {
      return response?.data?.friend;
    });
};

export const removeContact = (contactData) => {
  return axios
    .post('/remove', {
      username: contactData.userId,
      contact_phone: contactData.contact_phone,
    })
    .then((response) => {
      return response?.data?.friend;
    });
};
