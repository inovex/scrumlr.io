import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import Icon from '../Icon';
import { mockUser } from '../../builder';
import { UserList, UserListProps } from './UserList';
import { BoardUsers } from '../../types';

describe('<UserList />', () => {
  let wrapper: ShallowWrapper<UserListProps, {}>;
  let props: UserListProps = {
    boardUrl: 'mockUrl',
    admin: false,
    currentUserId: 'user1',
    users: { user1: mockUser() },
    onToggleReadyState: jest.fn(),
    onOpenModal: jest.fn()
  };

  it('should not render anything if no users are passed', () => {
    wrapper = shallow(<UserList {...props} users={{}} />);
    expect(wrapper.text()).toEqual('');
  });

  it('should render the correct amount of users if a user list is passed', () => {
    const users = {
      user1: mockUser({ name: 'User1' }),
      user2: mockUser({ name: 'User2' })
    };
    wrapper = shallow(<UserList {...props} users={users} />);
    const userItems = wrapper.find('.board__user-list > li');
    expect(userItems).toHaveLength(2);
  });

  describe('multi user', () => {
    let users: BoardUsers;
    let allUsers: ShallowWrapper<any, any>;
    let otherUsers: ShallowWrapper<any, any>;
    let ownUser: ShallowWrapper<any, any>;

    beforeEach(() => {
      users = {
        user1: mockUser({ name: 'User 1' }),
        user2: mockUser({ name: 'User 2' }),
        user3: mockUser({ name: 'User 3' })
      };

      wrapper = shallow(
        <UserList {...props} users={users} currentUserId="user1" />
      );
      allUsers = wrapper.find('.board__user-list > li');
      otherUsers = allUsers.filterWhere(
        item => (item.prop('aria-label') as string).indexOf('User') === 0
      );
      ownUser = allUsers.filterWhere(
        item => (item.prop('aria-label') as string).indexOf('Yourself') === 0
      );
    });

    it('should render the logged in user as last object', () => {
      expect(allUsers).toHaveLength(3);
      expect(otherUsers).toHaveLength(2);
      expect(ownUser).toHaveLength(1);
      expect(allUsers.at(2)).toEqual(ownUser);
    });

    it('should render other users and own user with different selection images', () => {
      const currentUserSelectionIcon = ownUser.find(Icon);
      const otherUserSelectionIcon = otherUsers.at(0).find(Icon);
      expect(currentUserSelectionIcon.prop('name')).toEqual('circle-selection');
      expect(otherUserSelectionIcon.prop('name')).toEqual(
        'circle-selection-grey'
      );
    });
  });
});
