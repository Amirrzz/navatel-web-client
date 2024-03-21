const DB_NAME = 'navatel';
const STORE_NAMES = ['files', 'avatars', 'stickers'];
const MAX_ITEMS = 1000;

const openDatabase = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      STORE_NAMES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      });
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const addItemToIndexDB = async (storeName, item) => {
  const db = await openDatabase();
  // const count = await getCount(db);
  // if (count >= MAX_ITEMS) {
  //   await deleteOldestItems(db, 5);
  // }
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.put(item);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const getItemFromIndexDB = async (storeName, itemId) => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(itemId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => reject(event.target.error);
  });
};

export const updateItemInIndexDB = async (storeName, item) => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.put(item);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteItem = async (storeName, itemId) => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.delete(itemId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};

const deleteOldestItems = async (db, count) => {
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.openCursor();
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        resolve();
      }
    };
    request.onerror = (event) => reject(event.target.error);
  });
};

const getCount = async (db) => {
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.count();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const itemExists = async (storeName, itemId) => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(itemId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const item = request.result;
      resolve(!!item);
    };
    request.onerror = (event) => reject(event.target.error);
  });
};

export const deleteDB = async () => {
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = () => {
    console.log('Database deleted successfully');
  };
  request.onerror = (event) => {
    console.error('Error deleting database:', event.target.error);
  };
};
