import { defineStore } from 'pinia';
import { fileUploader, downloaderFile } from '@/api/file/index.js';
import { getFile } from '@/helpers/parser.js';
import { useUserStore } from '@/store/user/user.js';
import {
  addItemToIndexDB,
  getItemFromIndexDB,
  updateItemInIndexDB,
} from '@/helpers/dbManager';

export const useFileManagerStore = defineStore('FileManagerStore', {
  $id: 'FileManagerStore',
  state: () => ({
    filesInUploding: {
      value: {},
    },
    filesInDownloading: {
      value: {},
    },
    blobFilePathDownloadedList: {},
    usersAvatarBlobList: {},
    stickerBlobList: {},
    activeRequests: new Map(), // Map to store active requests and their corresponding AbortController instances
  }),
  getters: {
    getUploadingPersentage(state) {
      return state.filesInUploding;
    },
  },
  actions: {
    async uploadFile(file, key = null, componentPersantageVariable = null) {
      /**
       * key is temp unique key assing in filesInUploading array
       * you can generate that simplay as file.name+Date.now()
       * if key passed to here it means we wanna get percentage of uploading file
       * percentage of uploading file accessable by getUploadingPersentage getter
       * componentPersantageVariable if exist it mean you want assign persantage in to your variable in component
       * note componentPersantageVariable must be = ref({})
       */
      const abortController = new AbortController();
      this.addActiveRequest(key, abortController); // Add the request and its AbortController to the map

      return fileUploader(
        file,
        key,
        componentPersantageVariable || this.filesInUploding,
        abortController,
      ).catch((e) => {
        if (e.message == 'canceled') {
          const key = e?.config?.signal?.reason;
          if (key && key.includes('-temp-file-id')) {
            this.removeActiveRequest(key);
          }
        }
      });
    },
    downloadFile(fileId, type, percentageNeeded = false) {
      return downloaderFile(
        fileId,
        type,
        percentageNeeded ? filesInDownloading : null,
      );
    },
    addActiveRequest(key, abortController) {
      this.activeRequests.set(key, abortController); // Add the request and its AbortController to the map
    },
    cancelRequest(key) {
      const abortController = this.activeRequests.get(key);
      if (abortController) {
        abortController.abort(key); // Cancel the specific request associated with the provided key
      }
    },
    removeActiveRequest(key) {
      this.activeRequests.delete(key); // Remove the completed or canceled request from the map
    },
    downloadFileFromWorker(fileId, type = 'image') {
      const userStore = useUserStore();
      const token = userStore.token;
      return getFile(fileId, token, type)
        .then((filePath) => {
          return filePath;
        })
        .catch(() => {
          return null;
        });
    },
    addToDownloadedList(data, key) {
      this.blobFilePathDownloadedList[key] = data;
    },
    async handlerForGettingFile(key, type = 'image', isThumbnail = false) {
      const fileId = key.split('.')[0];
      return new Promise(async (resolve, reject) => {
        let target = isThumbnail ? 'thumbnail' : type;
        const item = await getItemFromIndexDB('files', fileId);
        const isSameType = isThumbnail ? isThumbnail : item?.target === type;
        if (item && isSameType) {
          const file = item.mainFile || item.thumbnailFile;
          const data = {
            filePath: URL.createObjectURL(file),
            fileId: fileId,
            key: fileId,
            target,
            itsMain: item.target !== 'thumbnail',
          };
          this.blobFilePathDownloadedList[fileId] = data;

          resolve(data);
        } else {
          // not exist so send a request to getting from server
          return this.downloadFileFromWorker(fileId, target).then(
            async (fileData) => {
              const data = {
                filePath: fileData.filePath,
                fileId: fileId,
                key: fileId,
                target,
                itsMain: !isThumbnail,
                mainFile: isThumbnail ? item?.mainFile : fileData.blob,
                thumbnailFile: isThumbnail
                  ? fileData.blob
                  : item?.thumbnailFile,
                id: fileId,
              };

              this.blobFilePathDownloadedList[fileId] = data;

              if (item) {
                await updateItemInIndexDB('files', data);
              } else {
                await addItemToIndexDB('files', data);
              }

              resolve(data);
            },
          );
        }
      });
    },

    async handlerForSticker(stickerFileId) {
      return new Promise(async (resolve, reject) => {
        const item = await getItemFromIndexDB('stickers', stickerFileId);
        if (item) {
          const data = {
            filePath: URL.createObjectURL(item.file),
            fileId: stickerFileId,
            key: stickerFileId,
          };
          resolve(data);
        } else {
          // not exist so send a request to getting from server
          return this.downloadFileFromWorker(stickerFileId, 'image').then(
            async (fileData) => {
              const data = {
                filePath: fileData.filePath,
                fileId: stickerFileId,
                file: fileData.blob,
                id: stickerFileId,
              };
              if (item) {
                await updateItemInIndexDB('stickers', data);
              } else {
                await addItemToIndexDB('stickers', data);
              }

              resolve(data);
            },
          );
        }
      });
    },

    async gettingAvatarsHandler(userAvatarFileId, isThumbnail = true) {
      try {
        const item = await getItemFromIndexDB('avatars', userAvatarFileId);
        if (item) {
          if (item.thumbnailFile && isThumbnail) {
            this.usersAvatarBlobList[userAvatarFileId] = {
              thumbnailFile: URL.createObjectURL(item.thumbnailFile),
              mainFile: item.mainFile
                ? URL.createObjectURL(item.mainFile)
                : false,
            };
            return;
          }
          if (item.mainFile && !isThumbnail) {
            this.usersAvatarBlobList[userAvatarFileId] = {
              thumbnailFile: item.thumbnailFile
                ? URL.createObjectURL(item.thumbnailFile)
                : false,
              mainFile: URL.createObjectURL(item.mainFile),
            };
            return;
          }
        }
        const target = isThumbnail ? 'thumbnail' : 'image';

        this.downloadFileFromWorker(userAvatarFileId, target).then(
          async (fileData) => {
            const data = {
              id: userAvatarFileId,
              mainFile: isThumbnail ? item?.mainFile : fileData.blob,
              thumbnailFile: isThumbnail ? fileData.blob : item?.thumbnailFile,
            };
            if (item) {
              this.usersAvatarBlobList[userAvatarFileId] = {
                thumbnailFile: isThumbnail
                  ? fileData.filePath
                  : item.thumbnailFile
                  ? URL.createObjectURL(item.thumbnailFile)
                  : false,
                mainFile: !isThumbnail
                  ? fileData.filePath
                  : item.mainFile
                  ? URL.createObjectURL(item.mainFile)
                  : false,
              };
              await updateItemInIndexDB('avatars', data);
            } else {
              this.usersAvatarBlobList[userAvatarFileId] = {
                thumbnailFile: isThumbnail ? fileData.filePath : false,
                mainFile: !isThumbnail ? fileData.filePath : false,
              };
              await addItemToIndexDB('avatars', data);
            }
          },
        );
      } catch (error) {
        console.log(error, 'in catch');
      }
    },
  },
  persist: false,
});
