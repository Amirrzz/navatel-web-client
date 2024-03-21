import axios from './axiosConfig';

/**
 * Result Is flow_id tha we named userId in flowId
 */
export const initRequestForGettingFlowId = () => {
  return axios.post('/init-reg').then((response) => {
    return response.data.flow_id;
  });
};
/**
 * Result Is uuid And flow_id that defined
 * @param {String} phoneNumber The User`s Phone Number
 */
export const registerUserByPhone = (phoneNumber) => {
  //first try to getting flow_id then send register request
  return initRequestForGettingFlowId().then((flowId) => {
    return axios
      .post('/register', {
        phone_number: phoneNumber,
        flow_id: flowId,
      })
      .then((response) => {
        return getConfirmationCode(phoneNumber).then((responseOfGetCode) => {
          return {
            uuid: response.data.uuid,
            flowId: responseOfGetCode.data.flow_id,
          };
        });
      });
  });
};
/**
 * Result is a Confirmation code on User`s Phone input box
 * @param {String} phoneNumber The User`s Phone Number
 */
export const getConfirmationCode = (phoneNumber) => {
  return axios.post('/init-login-otp', {
    type: 'sms',
    to: phoneNumber,
  });
};
/**
 * Result is an object that contains jwt, uuid, session_token
 * @param {String} phoneNumber The User`s Phone Number
 * @param {String} flowId The response of initRequestForGettingFlowId (/init-reg) Api for getting flow id
 */
export const confirmOtpCode = (confirmCode, phoneNumber, flowId) => {
  return axios
    .post('/login-otp', {
      otp: confirmCode,
      identifier: phoneNumber,
      flow_id: flowId,
    })
    .then((response) => {
      if (response.data.jwt) return response.data;
      throw new Error('Dosent match confirm code');
    });
};
