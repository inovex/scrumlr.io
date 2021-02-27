import React from 'react'
import {render } from "@testing-library/react";
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import BoardUsers from 'components/BoardUsers/BoardUsers';
import Parse from 'parse';
import {getRandomName} from '../../constants/Name'

jest.mock('Parse');

const mockStore = configureStore()

const createBoardUsers = (state, numOfUsersToShow: number) => {
  const store = mockStore(state)

  return (
    <Provider store={store}>
      <BoardUsers numOfUsersToShow={numOfUsersToShow} />
    </Provider>
  );
};

describe('users', () => {

  beforeEach(() => {
    const mockCurrentUser = jest.fn(() => ({id: '@_online'}));
    Parse.User.current = mockCurrentUser;
  });

  const currentUser = {
    id: '@_online',
    displayName: 'Admin Mustermann',
    admin: true,
    online: true
  }

  const otherOnlineUsers = [...new Array(9)].map((_, i) => ({
    id: `${i}_online`,
    displayName: getRandomName(), 
    admin: (i%2===0)?true:false,
    online: true
  }));

  const adminWithOtherOnlineUsers = [currentUser, ...otherOnlineUsers];

  const offlineUsers = [...new Array(10)].map((_, i) => ({
    id: `${i}_offline`,
    displayName: getRandomName(),
    admin: (i%2===0)?false:true,
    online: false
  }));
  
  test('only online users are shown & their names are used as tooltips', () => { 

    const state = {
      users: {
        all: [
          ...offlineUsers,
          ...adminWithOtherOnlineUsers,
        ]
      }
    }
   
    const { container } = render(createBoardUsers(state, 4));

    const renderdUsersnames = Array.from(container.querySelectorAll('.user__initials')).map(ui=>ui.getAttribute('title')).join(':');
    const onlineUsernames = [...(otherOnlineUsers.slice(0, 3)), currentUser].map(u=>u.displayName).join(':');
    expect(renderdUsersnames).toBe(onlineUsernames);
  });

  test('correct number of online users & count of rest users', () => {
   
    // 4 online users -> display 4
    const state = {
      users: {
        all: [
          ...offlineUsers,
          ...(adminWithOtherOnlineUsers.slice(0, 4)),
        ]
      }
    }

    const boardUsers = render(createBoardUsers(state, 4));
    expect(boardUsers.container.querySelectorAll('.user__initials')).toHaveLength(4);

    // 5 online users -> display 5
    const newState1 = {
      users: {
        all: [
          ...offlineUsers,
          ...(adminWithOtherOnlineUsers.slice(0, 5)), // +1 additional online user
        ]
      }
    }
    const newBoardUsers1 = render(createBoardUsers(newState1, 4));
    expect(newBoardUsers1.container.querySelectorAll('.user__initials')).toHaveLength(5);

    // 6 online users -> display 4 & rest user count of 2
    const newState2 = {
      users: {
        all: [
          ...offlineUsers,
          ...(adminWithOtherOnlineUsers.slice(0, 6)), // +1 additional online user
        ]
      }
    }
    const newBoardUsers2 = render(createBoardUsers(newState2, 4));
    expect(newBoardUsers2.container.querySelectorAll('.user__initials')).toHaveLength(4);
    expect(newBoardUsers2.container.querySelector('.rest-users__count')).toHaveTextContent('2');
  });
});
