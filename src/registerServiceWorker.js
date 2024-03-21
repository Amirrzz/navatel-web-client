import { register } from 'register-service-worker';
import { version } from '@/../package.json';

export const registerHandler = (
  userId,
  sessionToken,
  token,
  browserName,
  osName,
) => {
  register(`service-worker.js`, {
    ready() {},
    async registered(e) {
      console.log(e, 'eeeee');
      const applicationServerKey =
        'BBO19b0QiG8Jvo8spacGG_OE2an-TaBrs27hMrEskR9mq4JQ6KMN__Izwe6Coy5LjNGZXK1-2JvNZBtkjKPkxNg';
      const options = { applicationServerKey, userVisibleOnly: true };

      let subscription = await e.pushManager.getSubscription();
      if (subscription == null) {
        subscription = await e.pushManager.subscribe(options);
      }
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${token}`);
      myHeaders.append('Content-Type', 'application/json');
      const raw = JSON.stringify({
        user_id: userId,
        push_token: JSON.stringify(subscription),
        pushkit_token: '',
        push_platform: '4',
        device_id: sessionToken,
        device_model: browserName,
        app_name: 'Navatel Web Aplication',
        app_ver: version,
        os_ver: osName,
        environment: process.env.NODE_ENV,
      });
      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };
      fetch('https://navaphone.com/push-biz/api/v1/subscribe', requestOptions)
        .then((response) => {})
        .catch((err) => {});

      /// event Handlers
      e.addEventListener('message', (event) => {
        const message = event.data;
        if (message.type === 'dataFromServiceWorker') {
          // Process the data received from the service worker
        }
      });
    },
  });
};
