import axios from './axiosConfig';
import { useUserStore } from '@/store/user/user.js';

/**
 * Result Is fileId
 * @param {File} file The File that user selected
 * @param {Boolean} pernectageNedded If it set false file uploading proceess automatic will be run
 */
export const fileUploader = (file, key, filesInUploding, abortController) => {
  // filesInUploding && key when exist it means we wanna get persentage of uploading file
  // filesInUploding && key came from fileManager.store
  // key passed from component
  // filesInuploading passed from component or fileManager store if you dont passed from component it use state store

  // for getting user token (jwt)

  const headers = {
    'Tus-Resumable': '1.0.0',
    'Upload-Length': file.size,
    'Upload-Metadata': `name ${checkAndConvertToValidBase64(
      file.name,
    )},type ${checkAndConvertToValidBase64(file.type)}`,
  };

  // First we send data about name and type to server in header
  // server depond on this data create an empty file on a directory
  // then server send information about that file in header response
  return axios
    .post(
      '/upload-tus/',
      {},
      {
        headers,
        signal: abortController?.signal,
      },
    )
    .then((response) => {
      // An example of response from server
      // https:services.navaphone.com/api/v1/upload-tus/20cae8fdab0f642b8d83baf0bf22f6be+OGY5Yzk4NzktNmFkMS00Nzg5LTllZGUtZDZjMmY4MzBhODg2LjAwYTdjNWIxLThiODAtNDcyYS1iOWFhLThjOGQzZWYyOGZlNQ==
      // The last part of url is path of file that store in server == file-path
      // file-path include two parts that combined together by + char
      // first part is fileId (left of + char)
      // second part is info about directory of file that store in server
      // all these that converted to base64
      const fileUrl = response.headers.location;
      //Save response in Storage for resuming uploading if we are have network probleming
      // we have done step 1 of uploading process file it is reserve place for file (creating file-name and directory in server)

      return binariesUploader(
        file,
        fileUrl,
        filesInUploding,
        key,
        abortController,
      );
    });
};

const binariesUploader = (
  file,
  url,
  filesInUploding,
  key,
  abortController,
  offset = 0,
) => {
  // for getting user token (jwt)
  // const userStore = useUserStore();

  const headerUrlSplitUp = url.split('/');
  const filePath = headerUrlSplitUp[headerUrlSplitUp.length - 1];
  const fileId = filePath?.split('+')[0];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const arrayBinary = reader.result?.slice(offset);
      //slice result is for resuming uploading goals
      //currently (8/13/2023) server have problem for sending offset value to client
      axios
        .patch(url, arrayBinary, {
          headers: {
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': '0',
            'Content-Type': 'application/offset+octet-stream',
          },
          signal: abortController?.signal,
          onUploadProgress: key
            ? (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                //first catch here
                filesInUploding.value[key] = {
                  fileId: fileId,
                  uploadingKey: key,
                  percentage: percentCompleted,
                };
              }
            : null,
        })
        .then(() => {
          // resolve fileId for using in client
          if (filesInUploding && key) {
            delete filesInUploding.value[key];
          }
          resolve(fileId);
        })
        .catch((e) => {
          reject(e);
        });
    };
  });
};
const baseUrl =
  import.meta.env['VITE_APP_BASE_URL'] + import.meta.env['VITE_APP_TUS_PATH'];

export const downloaderFile = (fileId, type = 'image', filesInDownloading) => {
  // for getting user token (jwt)
  const userStore = useUserStore();
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${userStore.token}`);
  const url = `${baseUrl}/download/${type}/${fileId}`;
  return (
    fetch(url, { headers })
      // Retrieve its body as ReadableStream
      .then((response) => {
        const reader = response.body.getReader();
        let contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                const loaded = (receivedLength * 100) / contentLength;
                //  prepard persantage to rendering in ui of we want to
                if (filesInDownloading) {
                  filesInDownloading[fileId] = {
                    fileId: fileId,
                    percentage: loaded,
                  };
                  // prepard persantage
                }
                if (done) {
                  controller.close();
                  if (filesInDownloading) {
                    delete filesInDownloading[fileId];
                  }
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      // Create a new response out of the stream
      .then((stream) => new Response(stream))
      // Create an object URL for the response
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      // Update image
      .then((url) => {
        return url;
      })
      .catch((err) => console.error(err))
  );
};

const regexForDetectFaChars = /^[a-zA-Z0-9.\b-/]+$/;
/**
 * Result Is Base64 String value
 * @param {String} value The desired value for converting to base64
 */
export const checkAndConvertToValidBase64 = (value) => {
  if (!regexForDetectFaChars.test(value)) {
    const splits = value.split('.');
    const extensionType = '.' + splits[splits.length - 1];
    const base64Name = btoa(`itWasUnvalidNameToConvertBase64` + extensionType);
    return base64Name;
  } else {
    const base64Name = btoa(value);
    return base64Name;
  }
};
