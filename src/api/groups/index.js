import axios from './axiosConfig';
import { prepardGroupData } from '@/helpers/grpParser.js';

export const createGroup = async (groupInformation) => {
  return await axios
    .post('/create', {
      title: groupInformation.title,
      avatar: groupInformation.avatar,
      participants: groupInformation.members,
    })
    .then((response) => {
      return response.data;
    });
};

export const getGroupTitle = (groupId) => {
  return axios.get(`config/title/${groupId}`).then((response) => {
    return response.data;
  });
};

export const getGroupAvatar = (groupId) => {
  return axios.get(`config/avatar/${groupId}`).then((response) => {
    return response.data;
  });
};

export const getGroupMembers = (groupId) => {
  return axios.get(`participant/${groupId}`).then((response) => {
    return response.data.participants;
  });
};

export const addMemberToCurrentGroup = (groupId, members) => {
  return axios
    .post(`participant/add/${groupId}`, {
      participants: members,
    })
    .then((response) => {
      return response;
    });
};

export const removeMemberFromCurrentGroup = (groupId, members) => {
  return axios
    .post(`participant/remove/${groupId}`, {
      participants: members,
    })
    .then((response) => {
      return response;
    });
};

export const addAdminRoleToMemberFromCurrentGroup = (groupId, members) => {
  return axios
    .post(`admin/add/${groupId}`, {
      participants: members,
    })
    .then((response) => {
      return response;
    });
};

export const removeAdminRoleToMemberFromCurrentGroup = (groupId, members) => {
  return axios
    .post(`admin/remove/${groupId}`, {
      participants: members,
    })
    .then((response) => {
      return response;
    });
};

export const leaveFromCurrentGroup = (groupId) => {
  return axios.post(`participant/leave/${groupId}`).then((response) => {
    return response.data;
  });
};

export const destroyCurrentGroup = (groupId) => {
  return axios.post(`/destroy/${groupId}`).then((response) => {
    return response.data;
  });
};

export const editTitleGroup = async (groupId, value) => {
  return await axios
    .post(`config/title/${groupId}`, {
      value: value,
    })
    .then((response) => {
      return response.data;
    });
};

export const updateAvatar = async (groupId, value) => {
  return await axios
    .post(`config/avatar/${groupId}`, {
      value: value,
    })
    .then((response) => {
      return response.data;
    });
};

export const getChatRoomList = (token) => {
  return axios.get('/get-list').then(async (res) => {
    if (res.data.groups) {
      return await prepardGroupData(res.data.groups, token);
    }
    return [];
  });
};

// *********** Send message in group chat part *********** //
// ======================================================= //
export const forwordMessage = (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response.data;
  });
};

export const sendTextMessage = (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response.data;
  });
};

export const sendFile = async (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response.data;
  });
};

export const sendVideo = async (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response.data;
  });
};

export const sendImage = async (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response;
  });
};

export const sendVoiceMessage = async (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response.data;
  });
};

export const sendSticker = async (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response;
  });
};

export const deleteMessage = async (param) => {
  return axios.post(`send/${param.groupId}`, param).then((response) => {
    return response.data;
  });
};

export const seenMessage = async (param) => {
  return axios.post(`send/${param.to}`, param).then((response) => {
    return response.data;
  });
};
