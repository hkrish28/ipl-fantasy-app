jest.mock('firebase/firestore', () => {
    const original = jest.requireActual('firebase/firestore');
    return {
      ...original,
      collectionGroup: jest.fn(() => ({
        docs: [],
      })),
      getDocs: jest.fn(() => Promise.resolve({
        docs: [],
      })),
      doc: jest.fn(),
      getDoc: jest.fn(() => Promise.resolve({
        exists: () => true,
        data: () => ({ name: 'Mock Competition', isLocked: false }),
      })),
      setDoc: jest.fn(),
      serverTimestamp: jest.fn(() => 'mock-timestamp'),
    };
  });
  