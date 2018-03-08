import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { default as Action, ActionProps } from './Action';

describe('<Action />', () => {
  let wrapper: ShallowWrapper<ActionProps, {}>;

  it('should match snapshot', () => {
    wrapper = shallow(<Action theme="mint">Test</Action>);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should extend list of classes when className is set', () => {
    const className = 'expected-test-class';
    wrapper = shallow(
      <Action theme="light" className={className}>
        Test
      </Action>
    );
    expect(wrapper.hasClass(className)).toBeTruthy();
  });
});
