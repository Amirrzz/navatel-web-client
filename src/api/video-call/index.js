import axios from './axiosConfig';

const baseUrl =
  import.meta.env['VITE_APP_BASE_URL'] + 'video-conference/api/v1';

export const makeVideoCall = (
  chatId,
  token,
  sessionToken,
  audio = true,
  video = false,
) => {
  const micStatus = audio ? 'on' : 'off';
  const videoStatus = video ? 'on' : 'off';
  const url = `${baseUrl}/conference/${chatId}?t=${token}&st=${sessionToken}&audio=${micStatus}&video=${videoStatus}`;
  var win = window.open(url, '_blank');
  win.focus();
};

export const videoCallState = async (chatId) => {
  try {
    await axios.get(`/conference/${chatId}/status`);
    return true;
  } catch (error) {
    return false;
  }
};

export const startCalling = async (chatId, token) => {
  return await axios.post(`/call/${chatId}?t=${token}`, {});
};
