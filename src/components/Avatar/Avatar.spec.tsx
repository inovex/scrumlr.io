import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import Avatar from '../Avatar';
import { AvatarProps } from './Avatar';

describe('<Avatar />', () => {
  let wrapper: ShallowWrapper<AvatarProps>;
  it('should initialize and match snapshot with image', () => {
    wrapper = shallow(<Avatar user={{ name: 'Hello', image: 'foo.jpg' }} />);
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.find('div')).toHaveLength(0);
  });

  it('should initialize and match snapshot with only username', () => {
    wrapper = shallow(<Avatar user={{ name: 'Hello' }} />);
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.find('img')).toHaveLength(0);
  });

  it('should use first letter of username capitalized', () => {
    wrapper = shallow(<Avatar user={{ name: 'hello' }} />);
    expect(wrapper.text()).toEqual('H');
  });

  it('should use first letter of username with starting emoji', () => {
    wrapper = shallow(<Avatar user={{ name: '🦄 hello' }} />);
    expect(wrapper.text()).toEqual('🦄');
  });
});
