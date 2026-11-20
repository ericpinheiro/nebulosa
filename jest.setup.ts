// Mocks de módulos nativos usados pela camada de serviços.
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string | number | boolean>();
  return {
    createMMKV: () => ({
      set: (k: string, v: string | number | boolean) => store.set(k, v),
      getString: (k: string) => {
        const v = store.get(k);
        return typeof v === 'string' ? v : undefined;
      },
      getNumber: (k: string) => {
        const v = store.get(k);
        return typeof v === 'number' ? v : undefined;
      },
      getBoolean: (k: string) => {
        const v = store.get(k);
        return typeof v === 'boolean' ? v : undefined;
      },
      remove: (k: string) => store.delete(k),
      contains: (k: string) => store.has(k),
      clearAll: () => store.clear(),
    }),
  };
});

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK: 0,
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
    __store: store,
  };
});

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: { registerPlaybackService: jest.fn(), addEventListener: jest.fn() },
  State: {},
  Event: {},
  Capability: {},
  IOSCategory: {},
  AppKilledPlaybackBehavior: {},
}));

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
