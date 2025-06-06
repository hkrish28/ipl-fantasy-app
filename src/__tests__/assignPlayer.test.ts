import { assignPlayer } from '@/lib/competitions';
import { setDoc, doc } from 'firebase/firestore';
import { CURRENT_SEASON } from '@/lib/constants';

jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    setDoc: jest.fn(),
    doc: jest.fn(),
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
  };
});

describe('assignPlayer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('writes assignment to correct Firestore path', async () => {
    const mockRef = { path: 'mock/path' };
    (doc as jest.Mock).mockReturnValue(mockRef);

    await assignPlayer('comp123', 'virat-kohli', 'user789');

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      `seasons/${CURRENT_SEASON}/competitions/comp123/assignments/virat-kohli`
    );

    expect(setDoc).toHaveBeenCalledWith(mockRef, {
      assignedTo: 'user789',
      assignedAt: 'mock-timestamp',
    });
  });
});
