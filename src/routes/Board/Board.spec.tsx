describe('TODO', () => {
  it('dummy', () => {
    expect(true).toEqual(true);
  });
});
/*import * as React from 'react';
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';

import { mockBoardConfig, mockCard, mockUser } from '../../builder';
import { BoardCards, BoardUsers } from '../../types';
import { Board, BoardProps } from './Board';

describe('<Board />', () => {
  let reactWrapper: ReactWrapper<BoardProps, {}>;
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
      boardUrl: '/boards/-foobar',
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
      history: null as any
    };
  });

  describe('lifecycle', () => {
    it('should register current user once component has been mounted', () => {
      const spy = jest.fn();
      reactWrapper = mount(
        <Board {...mockProps} onRegisterCurrentUser={spy} />
      );
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

  describe('export', () => {
    let cards: BoardCards;
    let users: BoardUsers;

    beforeEach(() => {
      users = {
        user1: mockUser({ name: 'User1' }),
        user2: mockUser({ name: 'User2' })
      };
      cards = {
        card1: mockCard({
          text: 'Text card 1',
          authorUid: 'user1',
          userVotes: { user1: 10, user2: 3 },
          type: 'positive'
        }),
        card2: mockCard({
          text: 'Text card 2',
          authorUid: 'user2',
          userVotes: { user1: 3, user2: -4 },
          type: 'negative'
        }),
        card3: mockCard({
          text: 'Text card 3',
          authorUid: 'user1',
          userVotes: { user2: -4 },
          parent: 'card1',
          type: 'positive'
        })
      };
    });

    it('should be possible to generate CSV from cards', () => {
      const separatorChar = '|';
      shallowWrapper = shallow(
        <Board {...mockProps} cards={cards} users={users} />
      );
      expect(
        (shallowWrapper.instance() as any).exportCsv(separatorChar)
      ).toMatchSnapshot();
    });

    it('should be possible to generate JSON from cards', () => {
      shallowWrapper = shallow(
        <Board {...mockProps} cards={cards} users={users} />
      );
      expect((shallowWrapper.instance() as any).exportJson()).toMatchSnapshot();
    });

    it('should export as JSON by default', () => {
      const spy = jest.fn(() => {});
      shallowWrapper = shallow(
        <Board
          {...mockProps}
          cards={cards}
          users={users}
          setupCompleted={true}
        />
      );
      const instance = shallowWrapper.instance() as any;
      // Check that correct export method is passed
      expect(shallowWrapper.find(Board).prop('onExport')).toEqual(
        instance.handleExport
      );
      // On export by default PDF export should be called
      instance.handleExportJson = spy;
      instance.handleExport();
      expect(spy).toHaveBeenCalled();
    });

    it('should export as CSV if requested', () => {
      const spy = jest.fn(() => {});
      shallowWrapper = shallow(
        <Board
          {...mockProps}
          cards={cards}
          users={users}
          setupCompleted={true}
        />
      );
      const instance = shallowWrapper.instance() as any;

      instance.handleExportCsv = spy;
      instance.handleExport('csv');
      expect(spy).toHaveBeenCalled();
    });

    it('should export as PDF if requested', () => {
      const spy = jest.fn(() => {});
      shallowWrapper = shallow(
        <Board
          {...mockProps}
          cards={cards}
          users={users}
          setupCompleted={true}
        />
      );
      const instance = shallowWrapper.instance() as any;

      instance.handleExportPdf = spy;
      instance.handleExport('pdf');
      expect(spy).toHaveBeenCalled();
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

  describe('guided phases', () => {
    it('should set guided accordingly to the board configuration', () => {
      const boardConfig = mockBoardConfig({ guided: true });
      shallowWrapper = shallow(
        <Board {...mockProps} boardConfig={boardConfig} setupCompleted={true} />
      );
      expect(shallowWrapper.find(Board).prop('guided')).toBe(true);
    });

    it('should set guidedPhase accordingly to the board configuration', () => {
      const boardConfig = mockBoardConfig({ guidedPhase: 2 });
      shallowWrapper = shallow(
        <Board {...mockProps} boardConfig={boardConfig} setupCompleted={true} />
      );
      expect(shallowWrapper.find(Board).prop('guidedPhase')).toBe(2);
    });
  });

  it('should show that app is loading if boardConfig is not ready yet', () => {
    shallowWrapper = shallow(
      <Board {...mockProps} boardConfig={undefined as any} />
    );
    expect(shallowWrapper.text()).toEqual(
      'Loading application configuration, please wait ...'
    );
  });

  it('should that user must be registered if setup is not completed yet', () => {
    shallowWrapper = shallow(<Board {...mockProps} setupCompleted={false} />);
    expect(shallowWrapper.text()).toEqual('Register user ...');
  });
});*/
