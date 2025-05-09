export const initializeApp = jest.fn();
export const getApps = jest.fn(() => []);
export const getApp = jest.fn(() => ({}));
export const getFirestore = jest.fn(() => ({}));
export const getAuth = jest.fn(() => ({
  onAuthStateChanged: jest.fn(),
}));
export const db = 'mock-db' as any;

export const auth = {
    currentUser: { uid: 'mock-user' },
    onAuthStateChanged: jest.fn(),
  } as any;
