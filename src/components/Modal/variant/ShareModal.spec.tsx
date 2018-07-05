import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
const { JSDOM } = require('jsdom');

import { ShareModal, ShareModalProps, ShareModalState } from './ShareModal';

jest.mock('../Modal');

describe('<ShareModal />', () => {
  let closeFunction: () => void;
  let shallowWrapper: ShallowWrapper<ShareModalProps, ShareModalState>;

  const baseUrl = 'http://localhost:3000/#';
  const boardId = '-L7ucuDefYZL6uvh-Q4C';

  beforeEach(() => {
    closeFunction = jest.fn();
    shallowWrapper = shallow(<ShareModal onClose={closeFunction} />);

    // FIXME workaround https://github.com/facebook/jest/issues/890
    delete (global as any).window;
    const window = new JSDOM(``, { url: `${baseUrl}/board/${boardId}` }).window;
    (global as any).window = window;
  });

  it('should match the expected structure', () => {
    expect(shallowWrapper.html()).toMatchSnapshot();
  });

  it('should provide the correct sharing url', () => {
    expect(
      shallowWrapper
        .find('a')
        .at(0)
        .props().href
    ).toEqual(`${baseUrl}/join/${boardId}`);
  });

  it('should hide the copy to clipboard message initially', () => {
    expect(shallowWrapper.find('.share-modal__copy-text--hidden')).toHaveLength(
      1
    );
  });
});
