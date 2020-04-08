import toBoolean from './toBoolean';

describe('toBoolean', () => {
    test('parse truthy values', () => {
        expect(toBoolean('true')).toBe(true);
        expect(toBoolean('yes')).toBe(true);
        expect(toBoolean('1')).toBe(true);
        expect(toBoolean('on')).toBe(true);
        expect(toBoolean('True')).toBe(true);
        expect(toBoolean('TRUE')).toBe(true);
        expect(toBoolean(true)).toBe(true);
    });

    test('parse falsy values', () => {
        expect(toBoolean('false')).toBe(false);
        expect(toBoolean('no')).toBe(false);
        expect(toBoolean('0')).toBe(false);
        expect(toBoolean('off')).toBe(false);
        expect(toBoolean('False')).toBe(false);
        expect(toBoolean('FALSE')).toBe(false);
        expect(toBoolean('<unknown>')).toBe(false);
        expect(toBoolean(false)).toBe(false);
        expect(toBoolean(undefined)).toBe(false);
        expect(toBoolean(null)).toBe(false);
    });
});
