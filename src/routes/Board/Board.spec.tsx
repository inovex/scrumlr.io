import * as React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';

import { mockBoardConfig, mockUser } from '../../builder';
import { BoardUsers } from '../../types';
import { Board, BoardProps } from './Board';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

describe('<Board />', () => {
  let shallowWrapper: ShallowWrapper<BoardProps, {}>;
  let mockProps: BoardProps;

  beforeEach(() => {
    const cards = {};
    const boardConfig = mockBoardConfig();
    const users = {};
    mockProps = {
      cards,
      boardConfig,
      users,
      isBoardAdmin: false,
      uid: '',
      registered: false,
      setupCompleted: false,

      onRegisterCurrentUser: jest.fn(),
      onToggleReadyState: jest.fn(),
      onFocusCard: jest.fn(),
      onSwitchPhaseIndex: jest.fn(),
      onSignOut: jest.fn(),
      onChangeBoardName: jest.fn(),

      match: {
        params: { id: '-foobar' },
        isExact: true,
        path: '/boards/:id',
        url: '/boards/-foobar'
      },
      location: null as any,
      history: null as any,
      boardSelector: 'test',
      boardPrintUrl: '/print',
      onChangeUsername: jest.fn(),
      onChangeEmail: jest.fn(),
      onToggleShowAuthor: jest.fn(),
      isShowAuthor: false,
      isAnonymous: false,
      acceptUser: jest.fn(),
      waitingUsers: []
    };
  });

  describe('lifecycle', () => {
    it('should register current user once component has been mounted', () => {
      const spy = jest.fn();
      mount(<Board {...mockProps} onRegisterCurrentUser={spy} />);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getUsername instance method', () => {
    it('should return correct username from given userlist in getUsername method', () => {
      const users: BoardUsers = {
        user1: mockUser()
      };
      shallowWrapper = shallow(<Board {...mockProps} users={users} />);
      expect((shallowWrapper.instance() as any).getUsername('user1')).toEqual(
        users.user1.name
      );
    });

    it('should return "Unknown user" if getUsername is called with unknown user id', () => {
      const users: BoardUsers = {
        user1: mockUser()
      };
      shallowWrapper = shallow(<Board {...mockProps} users={users} />);
      expect((shallowWrapper.instance() as any).getUsername('user2')).toEqual(
        undefined
      );
    });
  });

  describe('phases', () => {
    it('should call onSwitchPhaseIndex with correct index, when next phase is called', () => {
      const spy = jest.fn();
      shallowWrapper = shallow(
        <Board {...mockProps} onSwitchPhaseIndex={spy} />
      );
      (shallowWrapper.instance() as any).handleNextPhase();
      expect(spy).toHaveBeenCalledWith(+1);
    });
    it('should call onSwitchPhaseIndex with correct index, when previous phase is called', () => {
      const spy = jest.fn();
      shallowWrapper = shallow(
        <Board {...mockProps} onSwitchPhaseIndex={spy} />
      );
      (shallowWrapper.instance() as any).handlePrevPhase();
      expect(spy).toHaveBeenCalledWith(-1);
    });
  });

  it('should show that app is loading if boardConfig is not ready yet', () => {
    shallowWrapper = shallow(
      <Board {...mockProps} boardConfig={undefined as any} />
    );
    expect(shallowWrapper.find(LoadingScreen)).toHaveLength(1);
  });

  it('should that user must be registered if setup is not completed yet', () => {
    shallowWrapper = shallow(<Board {...mockProps} setupCompleted={false} />);
    expect(shallowWrapper.find(LoadingScreen)).toHaveLength(1);
  });
});
