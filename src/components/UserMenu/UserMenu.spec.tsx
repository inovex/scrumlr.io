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
      onOpenModal: jest.fn(),
      onPdfExport: jest.fn(),
      onCsvExport: jest.fn(),
      onChangeBoardName: jest.fn(),
      onSetTimer: jest.fn(),
      admin: true,
      isLastPhase: false
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

  describe('export', () => {
    it('should not display export menu item before last phase', () => {
      wrapper = shallow(<UserMenu {...props} />);
      const ddMenu = wrapper.find(DropdownMenu);

      expect(ddMenu.find(MenuItem).find({ name: 'Export' }).length).toEqual(0);
    });

    it('should display export menu item on last phase', () => {
      wrapper = shallow(<UserMenu {...props} />);
      const ddMenu = wrapper.find(DropdownMenu);

      expect(ddMenu.find(MenuItem).find({ name: 'Export' }).length).toEqual(0);
    });

    it('should pass correct method to export PDF button', () => {
      wrapper = shallow(<UserMenu {...props} isLastPhase={true} />);
      const ddMenu = wrapper.find(DropdownMenu);

      expect(props.onPdfExport).not.toHaveBeenCalled();
      ddMenu.find({ name: 'Pdf' }).simulate('click');
      expect(props.onPdfExport).toHaveBeenCalled();
    });

    it('should pass correct method to export CSS button', () => {
      wrapper = shallow(<UserMenu {...props} isLastPhase={true} />);
      const ddMenu = wrapper.find(DropdownMenu);

      expect(props.onCsvExport).not.toHaveBeenCalled();
      ddMenu.find({ name: 'Csv' }).simulate('click');
      expect(props.onCsvExport).toHaveBeenCalled();
    });
  });

  it('should not display delete board button to non admins', () => {
    wrapper = shallow(<UserMenu {...props} admin={false} />);
    const ddMenu = wrapper.find(DropdownMenu);
    expect(ddMenu.find(MenuItem).find({ name: 'Delete board' })).toHaveLength(
      0
    );
  });

  describe('delete board', () => {
    let _confirm: (message?: string) => boolean;

    beforeAll(() => {
      _confirm = ((global as any) as Window).confirm;
      ((global as any) as Window).confirm = () => true;
    });

    afterAll(() => {
      ((global as any) as Window).confirm = _confirm;
    });

    it('should pass correct method to delete board button', () => {
      wrapper = shallow(<UserMenu {...props} />);
      const ddMenu = wrapper.find(DropdownMenu);

      expect(props.onDeleteBoard).not.toHaveBeenCalled();
      ddMenu
        .find(MenuItem)
        .find({ name: 'Delete board' })
        .simulate('click');
      expect(props.onDeleteBoard).toHaveBeenCalled();
    });
  });

  it('should pass correct method to sign out button', () => {
    wrapper = shallow(<UserMenu {...props} />);
    const ddMenu = wrapper.find(DropdownMenu);

    expect(props.onSignOut).not.toHaveBeenCalled();
    ddMenu
      .find(MenuItem)
      .find({ name: 'Sign Out' })
      .simulate('click');
    expect(props.onSignOut).toHaveBeenCalled();
  });
});
