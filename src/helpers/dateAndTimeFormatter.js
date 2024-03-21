import { useWebWorkerFn } from '@vueuse/core';
export const dateFormatterWorker = async (
  dateString,
  locale,
  isFromMessages,
) => {
  const { workerFn } = useWebWorkerFn(
    async (dateString, locale, isFromMessages) => {
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
      function dateFormatter(date, type, locale) {
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
            };
            break;
          case 'month':
          case 'full':
            options = {
              timeZone,
              day: 'numeric',
              month: 'long',
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

      if (!isValidDate(dateString)) return '';

      let convertedDate;
      // becuse if isFromMessages be ture it has converted in parser
      if (isFromMessages) convertedDate = dateString;
      // type of dateString here is 2023-11-21 22:29:44 for example
      else convertedDate = fromGmtToUserTimeZone(dateString);
      //type of dateString here is Tue Nov 28 2023 23:29:02 GMT+0330 (Iran Standard Time) after convertor
      const typeOfDateForRendering = checkDatePositionAndFormmater(
        convertedDate,
        locale,
      );
      const resultRenderDate = dateFormatter(
        convertedDate,
        typeOfDateForRendering,
        locale,
      );
      return resultRenderDate;
    },
  );
  const result = await workerFn(dateString, locale, isFromMessages);
  return result;
};
export const dateFormatterHandler = (
  dateString,
  locale,
  options = {
    isFromMessages: false,
    isFromCallHistory: false,
    additionalFormater: null,
  },
) => {
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
    locale,
    options.additionalFormater,
  );
  return resultRenderDate;
};
export function utcToLocalDateConvertor(dateFromServer) {
  //2023-11-28 09:52:35.940322691 +0000 UTC example of input value
  //Tue Nov 28 2023 23:29:02 GMT+0330 (Iran Standard Time) example of output value
  const [datePart, timePart] = dateFromServer.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Create a Date object with UTC time
  const date = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds),
  );
  return date;
}
export function localDateToUTCConverter(localDateString) {
  const localDate = new Date(localDateString);

  // Get UTC date components
  const year = localDate.getUTCFullYear();
  const month = `0${localDate.getUTCMonth() + 1}`.slice(-2); // Month starts from 0
  const day = `0${localDate.getUTCDate()}`.slice(-2);
  const hours = `0${localDate.getUTCHours()}`.slice(-2);
  const minutes = `0${localDate.getUTCMinutes()}`.slice(-2);
  const seconds = `0${localDate.getUTCSeconds()}`.slice(-2);
  const milliseconds = `00${localDate.getUTCMilliseconds()}`.slice(-3);
  // Construct GMT date string
  const gmtDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} +0000 UTC`;
  return gmtDateString;
}
export function fromGmtToUserTimeZone(dateFromServer) {
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
export function fromUserTimeZoneToGmt(date) {
  const currentDate = date || new Date();
  const year = currentDate.getUTCFullYear();
  const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getUTCDate()).padStart(2, '0');
  const hours = String(currentDate.getUTCHours()).padStart(2, '0');
  const minutes = String(currentDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
export function dateFormatForCallHistory() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

export const checkDatePositionAndFormmater = (givenDate) => {
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
};
export function dateFormatter(date, type, locale, additionalFormater) {
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

export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

export function convertToTime(timestap) {
  let overall = (timestap / 1000000000).toFixed(0);
  let minutes = Math.floor(overall / 60);
  let seconds = +overall - minutes * 60;
  let hours = Math.floor(minutes / 60);
  return {
    seconds,
    minutes,
    hours,
  };
}
// Usge is a field in call history (CDR) item
export function convertSecoundToUsge(secound) {
  const overall = (secound / 1000) * 1000000000;
  return overall;
}

export function convertUtcToSupportedDate(dateString) {
  if (!dateString?.toString().includes('UTC')) return '';
  const parts = dateString.split(' ');
  const datePart = parts[0];
  const timePart = parts[1].substring(0, 8);
  const fullDateString = `${datePart}T${timePart}Z`;
  return new Date(fullDateString);
}
