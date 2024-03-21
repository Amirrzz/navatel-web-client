import { useWebWorkerFn } from '@vueuse/core';
import { useThemeStore } from '@/store/theme.js';

const replyMessageTypes = {
  text: 3,
  sticker: 4,
  image: 5,
  video: 6,
  audio: 7,
  file: 8,
  location: 9,
  notify: 10,
  deleted: 11,
  history: 12,
  WaitForResponse: 13,
  UnknownMessage: 14,
};

const videoAsFileTypes = [
  'video/webm',
  'video/x-flv',
  'video/mkv',
  'video/matroska',
  'video/x-matroska',
  'video/divxplus',
];

const videoAsAudioTypes = [
  'video/mpeg',
  'video/x-mpeg',
  'video/mkv',
  'video/matroska',
  'video/x-matroska',
  'video/divxplus',
];

export const detectTypeOfMessage = (information) => {
  let { mtype, data } = information;
  const messageType = mtype.split('.')[1];
  switch (messageType) {
    case 'cpy':
      return 'cpy';
    case 'txt':
    case 'jnd':
    case 'edt':
      return 'text';
    case 'img':
    case 'vid':
    case 'aud':
    case 'doc':
      return detectFileTypeForDownloading(data.type);
    case 'mis':
      return 'missCall';
    default:
      return null;
  }
};
export const detectFileTypeForSendingMessage = (type, forceFileType) => {
  const splitType = forceFileType || type.split('/')[0];
  switch (splitType) {
    case 'image':
      return {
        type: 'oto.img',
        notificationTitle: 'Image Message',
      };
    case 'video':
      return {
        type: 'oto.vid',
        notificationTitle: 'Video Message',
      };
    case 'audio':
      return {
        type: 'oto.aud',
        notificationTitle: 'Audio Message',
      };
    default:
      return {
        type: 'oto.doc',
        notificationTitle: 'File Message',
      };
  }
};

export const detectFileTypeForDownloading = (type) => {
  const splitType = type.split('/')[0];
  if (splitType === 'image' && !type.includes('svg')) return 'image';
  if (
    splitType === 'video' &&
    !videoAsFileTypes.includes(type) &&
    !videoAsAudioTypes.includes(type)
  )
    return 'video';
  if (splitType === 'audio' || videoAsAudioTypes.includes(type)) return 'audio';
  return 'file';
};
export const detectReplyMessageType = (data) => {
  if (typeof data === 'number' || !isNaN(Number(data))) {
    const inputNumber = Number(data);
    const messageType = Object.keys(replyMessageTypes).find(
      (key) => replyMessageTypes[key] === inputNumber,
    );
    return messageType ? messageType : 'UnknownMessage';
  } else if (typeof data === 'string') {
    const messageType = replyMessageTypes[data];
    return messageType ? messageType : 'UnknownMessage';
  } else {
    return 'Unknown type';
  }
};

export const detectUserAction = (information) => {
  if (information.mtype.split['.'][1] !== 'cst') return null;
  const { stt } = information.data;
  switch (stt) {
    case 'tps':
      return 'typingStart';
    case 'tpt':
      return 'typingStop';
    case 'rcs':
      return 'recordingAudioStart';
    case 'rct':
      return 'recordingAudioStop';
    case 'sfs':
      return 'sendingFileStart';
    case 'sft':
      return 'sendingFileStop';
    default:
      return null;
  }
};

export function calculateImageAndVideoAcceptRatio(
  imageDimension,
  minesGroupCard = 60,
) {
  const themeStore = useThemeStore();
  const screenDimension = {
    maxWidth: themeStore.getMaxWidthCardSizeInPx - minesGroupCard,
    maxHeight: (window.innerHeight * 40) / 100,
  };
  const { maxWidth, maxHeight } = screenDimension;
  const [imageWidth = 1000, imageHeight = 1000] =
    imageDimension?.split('x') || [];
  const originalWidth = imageWidth;
  const originalHeight = imageHeight;
  const aspectRatio = originalWidth / originalHeight;
  let renderedWidth, renderedHeight;

  if (originalWidth > maxWidth || originalHeight > maxHeight) {
    if (maxWidth / aspectRatio < maxHeight) {
      renderedWidth = maxWidth;
      renderedHeight = renderedWidth / aspectRatio;
    } else {
      renderedHeight = maxHeight;
      renderedWidth = renderedHeight * aspectRatio;
    }
  } else {
    // If the image is smaller than the maximum dimensions, keep its original size
    renderedWidth = originalWidth;
    renderedHeight = originalHeight;
  }
  return {
    renderedWidth,
    renderedHeight,
  };
}
export const uniqueByProperty = async ({
  listData,
  uniqueByProperty = 'id',
}) => {
  const { workerFn } = useWebWorkerFn((listData, uniqueByProperty) => {
    const uniqueArray = new Set();
    listData = listData.filter((item) => {
      const propertyValue = item[uniqueByProperty];
      if (uniqueArray.has(propertyValue)) {
        return false;
      } else {
        uniqueArray.add(propertyValue);
        return true;
      }
    });
    return listData;
  });
  const result = listData;
  return result;
};
export function splitJsonMessage({
  json,
  chankSize = 3.9,
  targetSeparateProperty = 'message',
}) {
  // Convert JSON object to string
  var jsonString = JSON.stringify(json);
  // Calculate the length of the string
  var bytes = new Blob([jsonString]).size;
  // Convert bytes to kilobytes
  var kilobytes = bytes / 1024;

  // If JSON size is greater than chankSize KB
  if (kilobytes > chankSize) {
    var parts = [];
    var chunkSize = chankSize * 1024; // Size of each part in bytes

    // Calculate the number of chunks required
    var numChunks = Math.ceil(bytes / chunkSize);

    // Iterate over the chunks
    for (var i = 0; i < numChunks; i++) {
      var part = {};
      // Iterate over the properties of the JSON object
      for (var key in json) {
        if (json.hasOwnProperty(key)) {
          if (key === targetSeparateProperty && typeof json[key] === 'string') {
            // Split the message into chunks
            var message = json[key];
            var startIndex = i * chunkSize;
            var endIndex = Math.min(startIndex + chunkSize, bytes);
            part[key] = message.substring(startIndex, endIndex);
          } else {
            // Add other properties as is to each part
            part[key] = json[key];
          }
        }
      }
      parts.push(part);
    }

    return parts;
  } else {
    // If JSON size is less than or equal to chankSize KB, return the original JSON
    return [json];
  }
}

// const largeJson = {
//   user: {
//     name: 'John Doe',
//     age: 30,
//     email: 'john@example.com',
//     address: {
//       street: '123 Main St',
//       city: 'Anytown',
//       state: 'CA',
//       zip: '12345',
//     },
//   },
//   post: {
//     title: 'Post 1',
//     content:
//       'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
//   },
// };

// console.log(
//   splitJsonMessage({
//     json: largeJson.post,
//     chankSize: 3,
//     targetSeparateProperty: 'content',
//   }),
// );
