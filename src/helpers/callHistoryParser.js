import { useWebWorkerFn } from '@vueuse/core';
export const orderCallHistory = async (callLogs) => {
  const { workerFn } = useWebWorkerFn(
    (list) => {
      const orderedList = _.orderBy(
        list,
        (item) => new Date(item.setup_time).getTime(),
        'desc',
      );
      return orderedList;
    },
    {
      dependencies: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      ],
    },
  );
  const callList = JSON.parse(JSON.stringify(callLogs));
  const result = await workerFn(callList);
  return result;
};
