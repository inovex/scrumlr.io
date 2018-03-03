import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import MenuItem, { MenuItemProps } from './MenuItem';
import Icon from '../../Icon';

describe('<MenuItem />', () => {
  let wrapper: ShallowWrapper<MenuItemProps, {}>;

  it('should pass the menu item name', () => {
    const name = 'Test';
    wrapper = shallow(
      <MenuItem name={name} icon="close" onClick={jest.fn()} />
    );
    expect(wrapper.find('span').text()).toEqual(name);
  });

  it('should pass the icon name', () => {
    const iconName = 'logout';
    wrapper = shallow(
      <MenuItem name="Logout" icon={iconName} onClick={jest.fn()} />
    );
    expect(wrapper.find(Icon).prop('name')).toEqual(iconName);
  });

  it('should pass the onClick function', () => {
    const onClick = jest.fn();
    wrapper = shallow(
      <MenuItem name="Settings" icon="settings" onClick={onClick} />
    );
    expect(wrapper.find('button').prop('onClick')).toEqual(onClick);
  });

  it('should pass class the onClick function', () => {
    const onClick = jest.fn();
    wrapper = shallow(
      <MenuItem name="Settings" icon="settings" onClick={onClick} />
    );
    wrapper.find('button').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});
