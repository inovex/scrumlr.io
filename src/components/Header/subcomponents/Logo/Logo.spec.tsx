import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { default as Logo, LogoProps } from './Logo';

jest.unmock('./Logo');
jest.mock('!svg-inline-loader!./logo.svg', () => 'svg', {
  virtual: true
});
jest.mock('!svg-inline-loader!./logo-s.svg', () => 'svg', {
  virtual: true
});

describe('<Logo />', () => {
  let wrapper: ShallowWrapper<LogoProps, {}>;

  it('should have default props', () => {
    expect(Logo.defaultProps).toMatchSnapshot();
  });

  it('should match snapshot', () => {
    expect(shallow(<Logo />).html()).toMatchSnapshot();
  });

  it('should be possible to pass custom css classes', () => {
    const className = 'foobar';
    wrapper = shallow(<Logo className={className} />);
    expect(wrapper.prop('className')).toContain(className);
  });
});
