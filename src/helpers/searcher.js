export function findLastItemInOldList(newList, oldList) {
  let lastOccurrenceIndex = -1;

  for (let i = 0; i < newList.length; i++) {
    const newItem = newList[i];
    const indexInOldList = binarySearchLastOccurrence(oldList, newItem.id);

    if (indexInOldList !== -1) {
      lastOccurrenceIndex = Math.max(lastOccurrenceIndex, indexInOldList);
    }
  }

  return lastOccurrenceIndex !== -1 ? oldList[lastOccurrenceIndex] : null;
}
function binarySearchLastOccurrence(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let lastIndex = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid].id === target) {
      lastIndex = mid; // Record the index of the target
      left = mid + 1; // Continue searching in the right half for last occurrence
    } else if (arr[mid].id < target) {
      left = mid + 1; // Search the right half
    } else {
      right = mid - 1; // Search the left half
    }
  }

  return lastIndex; // Return the index of the last occurrence
}
// // Example usage:
// const oldList = [{ id: 1 }, { id: 3 }, { id: 5 }, { id: 7 }, { id: 9 }];
// const newList = [{ id: 2 }, { id: 4 }, { id: 6 }, { id: 7 }, { id: 8 }];

// const lastItemInOldList = findLastItemInOldList(newList, oldList);
// console.log(lastItemInOldList); //
