import { useOverallChatsStore } from '@/store/chats/overall.js';
import { useCallStore, ringtoneAudio } from '@/store/call/call.js';

let wakeLock;
export function setScreenWakeLock(setOn = true) {
  if ('WakeLock' in window && 'request' in window.WakeLock) {
    const requestWakeLock = () => {
      const controller = new AbortController();
      const signal = controller.signal;
      window.WakeLock.request('screen', { signal }).catch((e) => {});
      return controller;
    };
    if (setOn) {
      if (wakeLock) {
        wakeLock.abort();
        wakeLock = null;
        wakeLock = requestWakeLock();
        return;
      }
      wakeLock = requestWakeLock();
    }
    if (!setOn && wakeLock) {
      wakeLock.abort();
      wakeLock = null;
    }
  } else if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch (e) {}
    };
    if (setOn) {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
        wakeLock = requestWakeLock();
        return;
      }
      wakeLock = requestWakeLock();
    }
    if (!setOn && wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }
}

export function handelBrowserTabVisibilityChange() {
  if (document.hidden !== undefined) {
    // Browser supports Page Visibility API

    // Attach visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Function to handle visibility change
    function handleVisibilityChange() {
      if (document.hidden) {
        // User switched away from the tab (lost focus)
        // Add your code to handle this scenario
      } else {
        setTimeout(() => {
          const overallChatStore = useOverallChatsStore();
          const callStore = useCallStore();
          if (!callStore.getCallModalStatus.showModal) {
            setTimeout(() => {
              const callStore = useCallStore();
              callStore.showCallingModalRef.$nextTick(() => {
                callStore.showCallingModalRef.$el.style = 'opacity:0';
                setTimeout(() => {
                  const callStore = useCallStore();
                  callStore.showCallingModalRef.$el.dismiss();
                  if (!ringtoneAudio?.paused) {
                    ringtoneAudio?.pause();
                  }
                }, 100);
              });
            }, 10);
          }
          overallChatStore.getChatList();
        }, 0);

        // User switched back to the tab (regained focus)
        // Add your code to handle this scenario
      }
    }
  } else {
    // Browser does not support Page Visibility API
  }
}

export function copyToClipboard(value) {
  navigator.clipboard
    .writeText(value)
    .then(() => {})
    .catch((err) => {
      console.error('Error copying text to clipboard:', err);
    });
}
