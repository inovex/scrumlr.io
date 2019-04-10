import { BoardConfig } from '../types';

export const mockBoardConfig = (
  overwrite?: Partial<BoardConfig>
): BoardConfig => {
  return {
    sorted: false,
    creatorUid: null,
    guided: false,
    guidedPhase: 0,
    timerExpiration: null,
    created: '',
    mode: 'positiveNegative',
    ...overwrite
  };
};
