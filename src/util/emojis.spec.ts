import { getCapitalLetter, getResidualUsername } from './emojis';

describe('utils/emojis', () => {
  describe('getCapitalLetter', () => {
    it('should return proper capital letter', () => {
      expect(getCapitalLetter('Hans')).toEqual('H');
      expect(getCapitalLetter('alice')).toEqual('A');
      expect(getCapitalLetter('🦄 Unicorn')).toEqual('🦄');
    });

    it('should handle empty values gracefully', () => {
      expect(getCapitalLetter()).toEqual('');
      expect(getCapitalLetter('')).toEqual('');
      expect(getCapitalLetter(null)).toEqual('');
      expect(getCapitalLetter(undefined)).toEqual('');
    });
  });

  describe('getResidualUsername', () => {
    it('should return proper residual username, stripped of first emoji', () => {
      expect(getResidualUsername('Hansi Wursti')).toEqual('Hansi Wursti');
      expect(getResidualUsername('alice in wonderland')).toEqual(
        'alice in wonderland'
      );
      expect(getResidualUsername('👻 Buster')).toEqual(' Buster');
    });

    it('should handle weird values aswell', () => {
      expect(getResidualUsername(undefined)).toEqual(undefined);
      expect(getResidualUsername(null)).toEqual(null);
      expect(getResidualUsername('')).toEqual('');
    });
  });
});
