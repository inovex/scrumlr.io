import { app } from './app';
import { EDIT_STATUS, MODAL_STATUS } from '../actions';

describe('root reducer', () => {
  describe('keyboard navigation', () => {
    it('should allow keyboard navigation in the default setting', () => {
      const state = app(undefined, { type: 'DUMMY_ACTION ' });
      expect(state.keyboardNavigationEnabled).toEqual(true);
    });

    it('should disable keyboard navigation on edit mode', () => {
      const state = app(
        undefined,
        { type: EDIT_STATUS, isActive: true } as any
      );
      expect(state.keyboardNavigationEnabled).toEqual(false);
    });

    it('should disable keyboard navigation on modal open', () => {
      const state = app(
        undefined,
        { type: MODAL_STATUS, isActive: true } as any
      );
      expect(state.keyboardNavigationEnabled).toEqual(false);
    });
  });
});
