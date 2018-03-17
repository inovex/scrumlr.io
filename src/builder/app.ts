import { AppState } from '../reducers';

export function mockAppState(overwrite?: Partial<AppState>): AppState {
  return {
    registered: false,
    setupCompleted: false,
    keyboardNavigationEnabled: true,
    ...overwrite
  };
}
