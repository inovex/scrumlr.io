import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { UserMenu, UserMenuProps, UserMenuState } from './UserMenu';
import MenuItem from './MenuItem';
const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

describe('<UserMenu />', () => {
  let wrapper: ShallowWrapper<UserMenuProps, UserMenuState>;
  let props: UserMenuProps;

  beforeEach(() => {
    props = {
      onSignOut: jest.fn(),
      onDeleteBoard: jest.fn(),
      onOpenSettings: jest.fn(),
      onOpenFeedback: jest.fn(),
      onOpenDonate: jest.fn(),
      onExport: jest.fn(),
      onChangeBoardName: jest.fn(),
      admin: true
    };
  });

  it('should render a dropdown menu by default', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);
    expect(ddMenu).toHaveLength(1);
  });

  it('should display the dropdown menu as closed by default', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);
    expect(ddMenu.prop('isOpen')).toEqual(false);
  });

  it('should toggle the user menu visibility when the toggle item is clicked', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);
    const toggleIcon = shallow(ddMenu.prop('toggle'));
    expect(wrapper.state('isOpen')).toEqual(false);
    toggleIcon.find('button').simulate('click');
    expect(wrapper.state('isOpen')).toEqual(true);
  });

  it('should pass correct method to export button', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);

    expect(props.onExport).not.toHaveBeenCalled();
    ddMenu.find(MenuItem).find({ name: 'Export' }).simulate('click');
    expect(props.onExport).toHaveBeenCalled();
  });

  it('should not display delete board button to non admins', () => {
    wrapper = shallow(<UserMenu {...props} admin={false} />);
    const ddMenu = wrapper.find(DropdownMenu);
    expect(ddMenu.find(MenuItem).find({ name: 'Delete board' })).toHaveLength(
      0
    );
  });

  it('should pass correct method to delete board button', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);

    expect(props.onDeleteBoard).not.toHaveBeenCalled();
    ddMenu.find(MenuItem).find({ name: 'Delete board' }).simulate('click');
    expect(props.onDeleteBoard).toHaveBeenCalled();
  });

  it('should pass correct method to sign out button', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);

    expect(props.onSignOut).not.toHaveBeenCalled();
    ddMenu.find(MenuItem).find({ name: 'Sign Out' }).simulate('click');
    expect(props.onSignOut).toHaveBeenCalled();
  });
});
