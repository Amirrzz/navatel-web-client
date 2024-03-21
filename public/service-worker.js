self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'setData') {
  }
});

self.addEventListener('activate', async () => {
  try {
    const applicationServerKey =
      'BBO19b0QiG8Jvo8spacGG_OE2an-TaBrs27hMrEskR9mq4JQ6KMN__Izwe6Coy5LjNGZXK1-2JvNZBtkjKPkxNg';
    const options = { applicationServerKey, userVisibleOnly: true };
    let subscription = await self.registration.pushManager.getSubscription();
    if (subscription == null) {
      subscription = await self.registration.pushManager.subscribe(options);
    }
  } catch (err) {}
});

// //Web Push Notifications//
// let body
self.addEventListener('push', function (event) {
  const payload = JSON.parse(event.data.text());
  console.log('=============================');
  console.log(event, 'event');
  console.log(payload, 'payload');
  console.log('=============================');

  if (
    payload.data?.body == 'voipcall' ||
    payload.data?.service_type == 'call'
  ) {
    const notificationTitle = payload.data?.nickname
      ? `${payload.data.nickname} تماس از`
      : 'تماس';
    const options = {
      body:
        payload.data.message == 'Missed call' ? 'تماس از دست رفته' : 'ورودی',
      silent: false,
      title: 'Incoming Call',
      // icon: "push_message.notification.icon",
      // image: push_message.notification.image,
      // vibrate: [200, 100, 200, 100, 200, 100, 200],
      tag: 'alert',
      actions: [
        {
          action: '/callpad',
          title: 'Show',
        },
      ],
    };
    event.waitUntil(
      self.registration.showNotification(notificationTitle, options),
    );
    return;
  }
  if (
    (payload?.data?.service_type == 'oto' &&
      payload?.data?.body != 'voipcall') ||
    payload?.data?.service_type == 'grp'
  ) {
    console.log(payload.message);
    console.log(payload.title, 'in service woker');
    const options = {
      body: payload.message || ' ',
      silent: false,
      title: payload.title || 'پیام',
      // icon: "push_message.notification.icon",
      // image: push_message.notification.image,
      // vibrate: [200, 100, 200, 100, 200, 100, 200],
      tag: 'alert',
      actions: [
        {
          action: '/message',
          title: 'Show',
        },
      ],
    };
    event.waitUntil(
      self.registration.showNotification(payload.title || 'پیام', options),
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  const baseUrl = window?.baseUrl || 'https://app.navatel.ir/';
  const clickedNotification = event.notification;
  clickedNotification.close();
  const promiseChain = self.clients.openWindow(baseUrl + 'callpad');
  event.waitUntil(promiseChain);
});
