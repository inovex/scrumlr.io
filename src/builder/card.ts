import { Card } from '../types';

export const mockCard = (overwrite?: Partial<Card>): Card => {
  return {
    authorUid: '11111111111111111111111',
    author: 'MockedAuthor',
    image: 'MockedImage',
    text: 'MockedText',
    type: 'positive',
    votes: 0,
    timestamp: '2017-07-31T16:30:39.537Z',
    userVotes: {},
    ...overwrite
  };
};
