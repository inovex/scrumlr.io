import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import WelcomeArea from './WelcomeArea';

describe('<WelcomeArea />', () => {
  it('should match snapshot', () => {
    const wrapper: ShallowWrapper<{}, {}> = shallow(
      <WelcomeArea>Some content</WelcomeArea>
    );
    expect(wrapper.html()).toMatchSnapshot();
  });
});
