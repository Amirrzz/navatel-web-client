import axios from './axiosConfig';

export const allUserStickers = () => {
  return axios.get(`stickerset/list/userid/0/100`).then((response) => {
    return response.data?.stickerSets || [];
  });
};

export const allStickers = () => {
  return axios.get(`stickerset/list/0/100`).then((response) => {
    return response.data;
  });
};

export const getStickerFileId = (id) => {
  return axios.get(`stickerset/allstickers/${id}/0/100`).then((response) => {
    return response.data;
  });
};

export const singleSticker = (id) => {
  return axios.get(`stickerset/id/${id}`).then((response) => {
    return response.data;
  });
};

export const addSticker = (id) => {
  return axios.get(`stickerset/add/${id}`).then((response) => {
    return response.data;
  });
};

export const deleteSticker = (id) => {
  return axios.delete(`stickerset/userid/${id}`).then((response) => {
    return response.data;
  });
};
