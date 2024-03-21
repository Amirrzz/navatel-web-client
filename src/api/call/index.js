import { WebSocketInterface, UA, debug } from 'jssip';
const baseUrl = import.meta.env['VITE_APP_SIP_WEBSOCKET_URL'];

debug.disable('JsSIP:*');

export const createWebSocketInterface = () => {
  const socket = new WebSocketInterface('wss://' + baseUrl);
  return socket;
};

export const setConfiguration = (socket, userDisplayName, userId, token) => {
  const configuration = {
    sockets: [socket],
    display_name: userDisplayName,
    uri: `sip:${userId}@${baseUrl}`,
    extra_headers: [`X-Token: ${token}`],
    register: true,
    supported: ['replaces', 'outbound'],
  };
  return configuration;
};

export const createConnectionInstance = (configuration) => {
  return new UA(configuration);
};

export function initConnection(userDisplayName, userId, token) {
  const socket = createWebSocketInterface();
  const configuration = setConfiguration(
    socket,
    userDisplayName,
    userId,
    token,
  );
  const userAgent = createConnectionInstance(configuration);
  return userAgent;
}
