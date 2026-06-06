import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const storage = {
  getItem: async (key: string) => {
    return window.sessionStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    window.sessionStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    window.sessionStorage.removeItem(key);
  },
};

export const queryPersister = createAsyncStoragePersister({
  storage,
  key: 'TRACKSY_QUERY_CACHE',
});
