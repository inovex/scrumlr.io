import { UserInformation } from '../types';

export function mockUser(overwrite?: Partial<UserInformation>) {
  return {
    name: 'MockUserName',
    image: 'MockUserImage',
    ready: false,
    ...overwrite
  };
}
