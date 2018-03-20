import { getGravatar } from './gravatar';

describe('gravatar', () => {
  it('should return correct URL when email is undefined', () => {
    expect(getGravatar('seed')).toEqual(
      'https://www.gravatar.com/avatar/73bd4103f29e62c9b31586b2bc4b165e?s=32&d=retro'
    );
  });

  it('should return correct URL when email is set', () => {
    expect(getGravatar('seed', 'jest@scrumlr.io')).toEqual(
      'https://www.gravatar.com/avatar/8e7361b3f7e0607098b225eb04749f92?s=32&d=retro'
    );
  });
});
