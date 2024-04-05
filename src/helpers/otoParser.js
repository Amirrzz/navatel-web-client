import { useWebWorkerFn } from '@vueuse/core';
import {
  detectTypeOfMessage,
  detectReplyMessageType,
  calculateImageAndVideoAcceptRatio,
  uniqueByProperty,
} from '@/helpers/chatMessageParser.js';
import {
  detectTextDirection,
  detetctTextIncludesLink,
} from '@/helpers/textFormatter.js';
import { bytesToMegabytes } from '@/helpers/formatter.js';
import {
  dateFormatterHandler,
  localDateToUTCConverter,
} from '@/helpers/dateAndTimeFormatter.js';
import { useThemeStore } from '@/store/theme.js';
import { useLocaleStore } from '@/store/locale.js';

export const chatsParser = async (
  serverListData,
  userId,
  source,
  groupMembers,
  minesGroupCard = 60,
  targetMessageId,
) => {
  const { workerFn } = useWebWorkerFn(
    async ({
      chatList,
      userId,
      screenDimension,
      source,
      members,
      localeFormat,
      targetMessageId,
    }) => {
      const detectTypeOfMessage = (information) => {
        const typeOfMessage = information.mtype.split('.')[1];
        if (['txt', 'jnd', 'edt'].includes(typeOfMessage)) return 'text';
        if (['img', 'vid', 'aud', 'doc'].includes(typeOfMessage)) {
          return detectFileTypeForDownloading(
            information.data.type || "image/''",
          );
        }
        if (
          ['crt', 'add', 'lft', 'jnd', 'rmv', 'cfg.tit', 'cfg.avt'].includes(
            typeOfMessage,
          )
        ) {
          return `notify.${typeOfMessage}`;
        }

        if (typeOfMessage == 'mis') {
          return 'missCall';
        }
        return null;
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
      const detectReplyMessageType = (data) => {
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
      const detectFileTypeForDownloading = (type) => {
        const splitType = type.split('/')[0];
        if (splitType == 'image' && !type.includes('svg')) return 'image';
        if (
          splitType == 'video' &&
          !videoAsFileTypes.includes(type) &&
          !videoAsAudioTypes.includes(type)
        ) {
          return 'video';
        }
        if (splitType == 'audio' || videoAsAudioTypes.includes(type))
          return 'audio';

        return 'file';
      };

      function detectTextDirection(text) {
        if (!text) return null;
        text = text.replaceAll(' ', ''); // Remove spaces from the input text
        let isRightToLeft = null;
        for (let index = 0; index < text.length; index++) {
          const char = text[index];
          if (/^[\u0600-\u06FF\s]+$/.test(char)) {
            isRightToLeft = true;
            break; // Exit loop when a character is detected
          } else if (/^[A-Za-z0-9]*$/.test(char)) {
            isRightToLeft = false;
            break; // Exit loop when a character is detected
          }
        }
        return isRightToLeft;
      }
      function calculateImageAndVideoAcceptRatio(imageDimension) {
        const [imageWidth = 1000, imageHeight = 1000] =
          imageDimension?.split('x') || [];
        const originalWidth = imageWidth;
        const originalHeight = imageHeight;
        const { maxWidth, maxHeight } = screenDimension;
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
      function detetctTextIncludesLink(text) {
        if (!text) return text;
        text = text.toLowerCase();
        const linkRegex = /(http(s)?:\/\/[^\s]+)/gi;
        const links = text.match(linkRegex);
        if (!links) return text;
        return renderTextWithAvailableLink(text);
      }
      function renderTextWithAvailableLink(text) {
        // Regular expression to find links in the string
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const stringWithHTMLLinks = text.replace(
          linkRegex,
          '<a href="$&" target="_blank">$&</a>',
        );
        return stringWithHTMLLinks;
      }
      function bytesToMegabytes(bytes) {
        return (bytes / (1024 * 1024)).toFixed(2); // Convert bytes to megabytes and round to 2 decimal places
      }
      function formmatedDate(dateString, localeFormat) {
        if (dateString?.toString().includes('UTC')) {
          const parts = dateString.split(' ');
          const datePart = parts[0];
          const timePart = parts[1].substring(0, 8);
          const fullDateString = `${datePart}T${timePart}Z`;
          // Create a Date object using the combined date string
          dateString = new Date(fullDateString).toString();
        }
        return dateFormatterHandler(dateString, localeFormat, {
          isFromMessages: true,
          isFromCallHistory: false,
          additionalFormater: {
            hour: 'numeric',
            minute: 'numeric',
          },
        });
      }
      function dateFormatterHandler(
        dateString,
        locale,
        options = {
          isFromMessages: false,
          isFromCallHistory: false,
          additionalFormater: null,
        },
      ) {
        if (!isValidDate(dateString)) return '';
        let convertedDate;
        // becuse if isFromMessages be ture it has converted in parser
        if (options.isFromMessages || options.isFromCallHistory)
          convertedDate = dateString;
        // type of dateString here is 2023-11-21 22:29:44 for example
        else if (!options.isFromCallHistory)
          convertedDate = fromGmtToUserTimeZone(dateString);
        //type of dateString here is Tue Nov 28 2023 23:29:02 GMT+0330 (Iran Standard Time) after convertor
        const typeOfDateForRendering = checkDatePositionAndFormmater(
          convertedDate,
          locale,
        );

        const resultRenderDate = dateFormatter(
          convertedDate,
          typeOfDateForRendering,
          localeFormat,
          options.additionalFormater,
        );
        return {
          value: resultRenderDate.value || resultRenderDate,
          isShamsiDate: localeFormat == 'fa-IR',
        };
      }
      function fromGmtToUserTimeZone(dateFromServer) {
        // dateFromServer 2023-11-21 22:29:44
        const date = new Date(dateFromServer);
        // Convert the date to GMT
        const dateInGMT = date.toISOString();
        // Get the user's timezone offset in minutes
        const userTimezoneOffset = new Date().getTimezoneOffset();
        // Calculate the user's timezone offset in milliseconds
        const userTimezoneOffsetMs = userTimezoneOffset * 60 * 1000;
        // Apply the user's timezone offset to the date
        const dateInUserTimezone = new Date(dateInGMT);
        dateInUserTimezone.setTime(
          dateInUserTimezone.getTime() - userTimezoneOffsetMs,
        );

        return dateInUserTimezone;
      }
      function checkDatePositionAndFormmater(givenDate) {
        givenDate = new Date(givenDate);
        // if (!givenDate && givenDate.getFullYear) return 'full';
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        if (givenDate.getFullYear() === currentYear) {
          const todayStart = new Date(
            currentYear,
            currentDate.getMonth(),
            currentDate.getDate(),
          );
          const weekStart = new Date(
            currentYear,
            currentDate.getMonth(),
            currentDate.getDate() - currentDate.getDay(),
          );
          const yesterdayStart = new Date(
            currentYear,
            currentDate.getMonth(),
            currentDate.getDate() - 1,
          );

          if (givenDate >= todayStart) {
            // today
            return 'time';
          } else if (givenDate >= yesterdayStart) {
            return 'yesterday';
          } else if (givenDate >= weekStart) {
            // week
            return 'day';
          } else {
            // before week , month
            return 'month';
          }
        } else if (givenDate.getFullYear() < currentYear) {
          return 'month';
        } else {
          return 'full';
        }
      }
      function dateFormatter(date, type, locale, additionalFormater) {
        // 2023-11-28T11:08:07.000Z
        // the format date should be above
        // 2023-11-28 09:52:35.940322691 +0000 UTC format must convert to this 2023-11-28T11:08:07.000Z fromat
        // you can use utcToIsoDateConvertor() in this file
        let options;
        let isYeasterday = false;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        switch (type) {
          case 'time':
            options = {
              timeZone,
              hour: 'numeric',
              minute: 'numeric',
            };
            break;
          case 'day':
            options = {
              timeZone,
              weekday: 'long',
              ...additionalFormater,
            };
            break;
          case 'month':
          case 'full':
            options = {
              timeZone,
              day: 'numeric',
              month: 'long',
              ...additionalFormater,
            };
            break;
          case 'yesterday':
            isYeasterday = true;
            options = {
              timeZone,
              hour: 'numeric',
              minute: 'numeric',
            };
            break;
          default:
            options = {
              timeZone,
              day: 'numeric',
              month: 'long',
              ...additionalFormater,
            };
            break;
        }

        const result = isYeasterday
          ? {
              isYesterday: true,
              value: new Date(date).toLocaleString(locale, options),
            }
          : new Date(date).toLocaleString(locale, options);
        return result;
      }
      function isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
      }
      const filteredList = [];
      let member = null;
      chatList.forEach((item) => {
        const chatBody = JSON.parse(item.body);
        const { creation_time, from, modification_time, deliverstatus } = item;
        const { data, message } = chatBody;
        const { dim, edit_state, ext_data, guid } = data;
        if (guid == targetMessageId && !item.dosentRemove) return;
        const extraData = ext_data
          ? typeof ext_data == 'string'
            ? JSON.parse(ext_data)
            : ext_data
          : {};
        const itsMe = from == userId;
        const isForwarded = Boolean(extraData.forwardMsgId);
        if (members) {
          member = members.find((member) => {
            return member.contact_username == item.from;
          });
        }
        let forwardedData = null;
        if (isForwarded) {
          const { forwardFromId, forwardSType, forwardFromName } = extraData;
          forwardedData = {
            forwardFromId,
            forwardSType,
            forwardFromName,
            renderForwardedType: detectTypeOfMessage(chatBody),
          };
        }

        const type = detectTypeOfMessage(chatBody);
        let content =
          type === 'text' || type === 'missCall'
            ? detetctTextIncludesLink(message)
            : data.fileId;

        const isReplied = Boolean(extraData.replyMsgId);
        let repliedData = null;

        if (isReplied) {
          const {
            replyDescription,
            replyMsgId,
            replyType,
            replyFileId,
            ReplyFromName,
            replyFromName,
          } = extraData;
          const textDirectionIsRtl = detectTextDirection(replyDescription);
          repliedData = {
            messageText: replyDescription,
            targetMessageId: replyMsgId,
            textDirectionIsRtl,
            replyType,
            replyFileId,
            replyFromName: ReplyFromName || replyFromName,
            renderReplyType: detectReplyMessageType(replyType),
          };
        }
        const isEdited = Boolean(edit_state);
        const editedInfo = isEdited
          ? { isEdited, date: modification_time }
          : false;
        const dimension = ['image', 'video'].includes(type)
          ? calculateImageAndVideoAcceptRatio(dim)
          : null;

        const detectedNotifyType = (type) => {
          switch (type) {
            case 'lft':
              return 'leftthegroup';
              break;
            case 'crt':
              return 'createdgroup';
              break;
            case 'add':
              return 'addedtogroup';
              break;
            case 'jnd':
              return '';
              break;
            case 'rmv':
              return 'removed';
              break;
            case 'cfg.tit':
              return '';
              break;
            case 'cfg.avt':
              return 'changeavatar';
              break;
          }
        };

        const information = {
          id: guid,
          type,
          status: Boolean(deliverstatus) ? 'seen' : 'sent',
          content,
          date: formmatedDate(creation_time),
          repliedData,
          forwardedData,
          editedInfo,
          textDirectionIsRtl:
            type === 'text' ? detectTextDirection(message) : null,
          dimension,
          itsMe,
          source,
          notifyType: detectedNotifyType(type.split('.')[1]),
          additionalMessageInfo: {
            uuid: from,
            userInformation: member,
            ...data,
            mbSize: bytesToMegabytes(data?.size),
            renderedType: data?.name?.split('.')[1].toLocaleUpperCase(),
          },
        };
        filteredList.push(information);
      });
      return filteredList.reverse();
    },
  );
  // Create a function for getting a variable value
  const themeStore = useThemeStore();
  const localeStore = useLocaleStore();
  const localeFormat = localeStore.getLocaleFormat;
  const screenDimension = {
    maxWidth: themeStore.getMaxWidthCardSizeInPx - minesGroupCard,
    maxHeight: (window.innerHeight * 40) / 100,
  };
  const result = await workerFn({
    chatList: serverListData,
    members: groupMembers,
    userId,
    screenDimension,
    source,
    localeFormat,
    targetMessageId,
  });
  const uniqueArray = await uniqueByProperty({ listData: result });
  return uniqueArray;
};

export function generateDataModelMessage(
  messageItem,
  itsMe,
  textDirectionIsRtl,
  type,
  members,
  minesGroupCard = 60,
) {
  try {
    const themeStore = useThemeStore();
    const localeStore = useLocaleStore();
    const localeFormat = localeStore.getLocaleFormat;
    const { data, message, id } = messageItem;
    const extraData = data?.ext_data
      ? typeof data.ext_data == 'string'
        ? JSON.parse(data.ext_data)
        : data.ext_data
      : {};
    const isForwarded = Boolean(extraData.forwardMsgId);
    const forwardedData = isForwarded
      ? extractForwardedData({
          extraData,
          mtype: messageItem.mtype,
          fileType: type,
        })
      : null;
    type ??= detectTypeOfMessage(messageItem);
    let dimension = null;
    let content;
    let previewState;
    if (type !== 'text') {
      dimension =
        ['vid', 'img'].includes(type.split('.')[1]) ||
        ['video', 'image'].includes(type)
          ? calculateImageAndVideoAcceptRatio(data.dim, minesGroupCard)
          : false;
      previewState = messageItem.previewBlob;
      content = data.fileId;
    } else {
      content = detetctTextIncludesLink(message);
      textDirectionIsRtl ??= detectTextDirection(message);
    }

    if (isForwarded) {
      content = type !== 'text' ? content : detetctTextIncludesLink(message);
      textDirectionIsRtl ??= detectTextDirection(message);
    } else {
      type = detectTypeOfMessage(messageItem);
    }
    const isReplied = Boolean(extraData.replyMsgId);
    const repliedData = isReplied ? extractRepliedData(extraData) : null;
    let member = null;

    if (members) {
      member = members.find((member) => {
        return member.contact_username == messageItem.from;
      });
    }
    const status = data?.fileId?.includes('-temp-file-id')
      ? 'uploading'
      : 'sending';
    let dateString = null;
    if (itsMe) {
      dateString = localDateToUTCConverter(new Date()).toString();
    } else {
      dateString = messageItem.data.ts;
    }
    const formattedDate = dateFormatterHandler(dateString, localeFormat, {
      isFromMessages: true,
      isFromCallHistory: false,
      additionalFormater: {
        hour: 'numeric',
        minute: 'numeric',
      },
    });
    const information = {
      content,
      date: {
        value: formattedDate.value || formattedDate,
        isShamsiDate: localeFormat == 'fa-IR',
      },
      dimension,
      repliedData,
      forwardedData,
      editedInfo: false,
      status,
      id: id || data.guid,
      itsMe,
      textDirectionIsRtl,
      type,
      previewState,
      additionalMessageInfo: {
        userInformation: member,
        ...data,
        mbSize: bytesToMegabytes(data?.size),
        renderedType: data?.name?.split('.')[1].toLocaleUpperCase(),
      },
    };
    return information;
  } catch (error) {
    console.log(error, 'error in OTOParser ');
  }
}
function extractForwardedData({ extraData, mtype, fileType }) {
  const messageTypeData = {
    mtype: mtype,
    data: {
      type: fileType,
    },
  };
  return {
    targetMessageId: extraData.forwardFromId,
    forwardType: extraData.forwardSType,
    forwardFromName: extraData.forwardFromName,
    renderForwardedType: detectTypeOfMessage(messageTypeData),
  };
}

function extractRepliedData(extraData) {
  const text = extraData.replyDescription;
  const textDirectionIsRtl = detectTextDirection(text);

  return {
    messageText: text,
    targetMessageId: extraData.replyMsgId,
    textDirectionIsRtl,
    renderReplyType: detectReplyMessageType(extraData.replyType),
    replyType: extraData.replyType,
    replyFileId: extraData.replyFileId,
    replyFromName: extraData.ReplyFromName || extraData.replyFromName,
  };
}

export const keepUniqueAndUpdate = async ({ oldList, newList }) => {
  const { workerFn } = useWebWorkerFn(async ({ oldList, newList }) => {
    const oldListIds = oldList.map((e) => e.id);
    let filtredList = newList.filter((item) => {
      if (!oldListIds.includes(item.id)) {
        return item;
      }
    });
    // Convert the map back to an array of values
    return filtredList || [];
  });
  const oldListData = JSON.parse(JSON.stringify(oldList));
  // Add items from the old list to the map
  const result = await workerFn({ oldList: oldListData, newList });
  console.log(result);
  return result;
};

export const orderListHandler = async (chatsList) => {
  const { workerFn } = useWebWorkerFn(
    (chatsList) => {
      const orderedList = _.orderBy(chatsList, (item) =>
        new Date(item.date).getTime(),
      );
      return orderedList;
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  const result = await workerFn(chatsList);
  return result;
};
