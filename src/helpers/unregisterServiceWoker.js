export default () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      // Unregister all service workers
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
};
