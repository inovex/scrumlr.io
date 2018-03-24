import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { Header, HeaderProps } from './Header';
import { PhaseMenu } from '../PhaseMenu';
import { UserList } from '../UserList';
import { UserMenu } from '../UserMenu';
import { mockUser } from '../../builder';

describe('<Header />', () => {
  let wrapper: ShallowWrapper<HeaderProps, {}>;
  let props: HeaderProps;

  beforeEach(() => {
    props = {
      boardId: 'test',
      admin: false,
      mode: 'positiveNegative',
      phase: 0,
      isLastPhase: false,
      sorted: false,
      onPrevPhase: jest.fn(),
      onNextPhase: jest.fn(),
      loggedIn: false,
      onExport: jest.fn(),
      onSignOut: jest.fn(),
      onChangeBoardName: jest.fn(),
      user: 'user1',
      users: { user1: mockUser() },
      onToggleReadyState: jest.fn(),
      onOpenModal: jest.fn(),
      onDeleteBoard: jest.fn()
    };
  });

  describe('phase menu', () => {
    it('should show a phase menu', () => {
      wrapper = shallow(<Header {...props} />);
      expect(wrapper.find(PhaseMenu)).toHaveLength(1);
    });

    it('should pass arguments correctly', () => {
      wrapper = shallow(<Header {...props} />);
      const phaseMenu = wrapper.find(PhaseMenu);
      expect(phaseMenu.prop('admin')).toEqual(props.admin);
      expect(phaseMenu.prop('guidedPhase')).toEqual(props.phase);
      expect(phaseMenu.prop('onPrevPhase')).toEqual(props.onPrevPhase);
      expect(phaseMenu.prop('onNextPhase')).toEqual(props.onNextPhase);
    });
  });

  describe('user list', () => {
    it('should show a user list', () => {
      wrapper = shallow(<Header {...props} />);
      expect(wrapper.find(PhaseMenu)).toHaveLength(1);
    });

    it('should pass arguments correctly', () => {
      wrapper = shallow(<Header {...props} />);
      const userList = wrapper.find(UserList);
      expect(userList.prop('currentUserId')).toEqual(props.user);
      expect(userList.prop('users')).toEqual(props.users);
      expect(userList.prop('onToggleReadyState')).toEqual(
        props.onToggleReadyState
      );
    });
  });

  describe('user menu', () => {
    it('should not render a user menu if the user is not logged in', () => {
      wrapper = shallow(<Header {...props} loggedIn={false} />);
      expect(wrapper.find(UserMenu)).toHaveLength(0);
    });

    it('should render a user menu if the user is logged in', () => {
      wrapper = shallow(<Header {...props} loggedIn={true} />);
      expect(wrapper.find(UserMenu)).toHaveLength(1);
    });

    it('should pass arguments correctly', () => {
      wrapper = shallow(<Header {...props} loggedIn={true} />);
      const userMenu = wrapper.find(UserMenu);
      expect(userMenu.prop('onExport')).toEqual(props.onExport);
      expect(userMenu.prop('onSignOut')).toEqual(props.onSignOut);
    });
  });
});
