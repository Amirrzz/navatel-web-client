import { defineStore } from 'pinia';

export const useThemeStore = defineStore('ThemeStore', {
  state: () => ({
    autoDetected: null, // fa,en
    userSelected: null,
    cssVariableSizes: {
      sidebarSize: 0, //px
      chatCardSize: 79, //vw
      chatCardVoiceSize: 79, //vw
    },
    platforms: [],
  }),
  getters: {
    getThemeIsDark(state) {
      if (state.userSelected) {
        return state.userSelected == 'dark' ? true : false;
      }
      return state.autoDetected == 'dark' ? true : false;
    },
    getMaxWidthCardSizeInPx(state) {
      const { sidebarSize, chatCardSize } = state.cssVariableSizes;
      return ((window.innerWidth - sidebarSize) * chatCardSize) / 100;
    },
  },

  actions: {
    setAutoDetectedTheme() {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        this.autoDetected = 'dark';
        // Dark mode is preferred by the user
      } else {
        // Light mode is preferred by the user
        this.autoDetected = 'light';
      }
    },
    setUserSelectedThem(value) {
      this.userSelected = value;
    },
    setCssVariableSize(platforms) {
      this.platforms = platforms;
      const rootElement = document.querySelector(':root');
      if (
        platforms.includes('desktop') ||
        (platforms.includes('tablet') &&
          !platforms.includes('mobile') &&
          !platforms.includes('mobileweb'))
      ) {
        /// set variable desktop sizes
        this.setStateCssSize({
          sidebarSize: 380,
          chatCardSize: 55,
          chatCardVoiceSize: 46,
        });
        rootElement.style.setProperty('--sidebar-size', '380px');
        rootElement.style.setProperty('--chat-card-size', '55vw');
        rootElement.style.setProperty('--chat-card-voice-size', '46vw');

        return;
      }
      /// set mobile css variable sizes
      this.setStateCssSize({
        sidebarSize: 0,
        chatCardSize: 79,
        chatCardVoiceSize: 70,
      });

      rootElement.style.setProperty('--sidebar-size', '0px');
      rootElement.style.setProperty('--chat-card-size', '79vw');
      rootElement.style.setProperty('--chat-card-voice-size', '70vw');
    },
    setStateCssSize({ sidebarSize, chatCardSize, chatCardVoiceSize }) {
      this.cssVariableSizes.sidebarSize = sidebarSize; //px
      this.cssVariableSizes.chatCardSize = chatCardSize; //vw
      this.cssVariableSizes.chatCardVoiceSize = chatCardVoiceSize; //vw
    },
  },
  persist: true,
});
