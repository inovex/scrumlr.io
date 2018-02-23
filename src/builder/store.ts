import { StoreState } from '../types';
import { mockAppState } from './';

export function mockStoreState(overwrite?: Partial<StoreState>): StoreState {
  return {
    fbState: {},
    app: mockAppState(),
    ...overwrite
  };
}
