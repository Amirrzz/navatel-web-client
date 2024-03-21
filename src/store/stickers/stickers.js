import { defineStore } from 'pinia';
import { useNestedModals } from '@/store/nestedModals/nestedModals.js';
import { handlerForSingleStickerData } from '@/helpers/parser.js';

import {
  singleSticker,
  allUserStickers,
  allStickers,
  addSticker,
  deleteSticker,
  getStickerFileId,
} from '../../api/stickers/index.js';

export const useStickersStore = defineStore('stickersStore', {
  state: () => ({
    allStickers: [],
    userStickers: [],
    singleSticker: {},
    loading: false,
    skeltonLoading: false,
    myStickerSkeltonLoading: false,
  }),

  getters: {
    getStickers() {
      const UserStickers = this.userStickers;
      const Stickers = this.allStickers;
      if (UserStickers) {
        return [
          ...UserStickers.filter((userSticker) =>
            Stickers.every((sticker) => sticker.id != userSticker.id),
          ),
          ...Stickers.filter((sticker) =>
            UserStickers.every((userSticker) => userSticker.id != sticker.id),
          ),
        ];
      } else {
        return Stickers;
      }
    },
  },

  actions: {
    changeMyStickerSkeltonLoadingStatus(status) {
      this.myStickerSkeltonLoading = status;
    },

    changeSkeltonLoadingStatus(status) {
      this.skeltonLoading = status;
    },

    clearStickerDataSource() {
      this.allStickers = [];
      this.userStickers = [];
    },

    async setSingleSticker(id) {
      this.singleSticker = {};
      const response = await singleSticker(id);
      const allFileId = await getStickerFileId(response.id);
      const blobsLink = await handlerForSingleStickerData(allFileId);
      const result = { ...response, stickers: blobsLink };
      this.singleSticker = result;
    },

    async getAllUserStickers() {
      this.userStickers = [];
      let stickers = await allUserStickers();
      for (let sticker of stickers) {
        const allFileId = await getStickerFileId(sticker.id);
        const result = { ...sticker, stickers: allFileId.stickers };
        this.userStickers.push(result);
      }
    },

    async getAllStickers() {
      this.allStickers = [];
      let response = await allStickers();
      for (let i of response.stickerSets) {
        const allFileId = await getStickerFileId(i.id);
        const result = { ...i, stickers: allFileId.stickers };
        this.allStickers.push(result);
      }
    },

    async addStickerForUser(id) {
      await addSticker(id);
      this.loading = true;
      await this.getAllUserStickers();
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },

    async deleteStickerForUser(id) {
      const nestedModals = useNestedModals();
      await deleteSticker(id);
      this.getAllUserStickers();
      nestedModals.openStickerInformationModal();
    },
  },
});
