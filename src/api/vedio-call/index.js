const baseUrl =
  import.meta.env['VITE_APP_BASE_URL'] + 'video-conference/api/v1';
export const makeConferenceInGroup = (groupId, token) => {
  const url = `${baseUrl}/call/${groupId}?t=${token}`;
  var win = window.open(url, '_blank');
  win.focus();
};

export const makeVedioCallInOTO = (chatId, token) => {
  // chatId is equally by userId
  const url = `${baseUrl}/conference/${chatId}?t=${token}`;
  var win = window.open(url, '_blank');
  win.focus();
};
