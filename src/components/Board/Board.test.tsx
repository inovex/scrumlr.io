import React from 'react'
import { act, render, fireEvent, within } from "@testing-library/react";
import Board from "./Board";
import Column from "components/Column/Column";
import { Color } from "constants/colors";
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import BoardUsers from 'components/BoardUsers/BoardUsers';
import Parse from 'parse';
import { resolve } from 'path';

jest.mock('Parse');

const mockStore = configureStore()

const createBoardWithColumns = (...colors: Color[]) => {

  const initialState = {
    users: {
      admins: [],
      basic: [],
      all: []
    }
  }
  const store = mockStore(initialState)

  return (
    <Provider store={store}>
      <Board>
        {colors.map((color, index) => <Column key={index} color={color} />)}
      </Board>
    </Provider>
  )
};

describe('basic', () => {

  beforeEach(() => {
    window.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      disconnect: jest.fn()
    }) as any);
  });

  test('show empty board', () => {
    const { container } = render(createBoardWithColumns());
    expect(container.firstChild).toHaveClass("board--empty");
  });

  test('correct number of columns is set in inner styles', () => {
    const { container } = render(createBoardWithColumns('violet', 'pink', 'blue', 'purple'));
    expect(container.querySelector('style')).toHaveTextContent('.board { --board__columns: 4 }');
  });

  describe('side-panels', () => {

    test('left side-panel is present', () => {
      const { container } = render(createBoardWithColumns('blue', 'pink'));
      // @ts-ignore
      expect(container.querySelector(".board").firstChild).toHaveClass("board__spacer-left");
    });

    test('right side-panel is present', () => {
      const { container } = render(createBoardWithColumns('blue', 'pink'));
      // @ts-ignore
      expect(container.querySelector(".board").lastChild).toHaveClass("board__spacer-right");
    });

    test('left side-panel has correct accent color', () => {
      const { container } = render(createBoardWithColumns('blue', 'pink'));
      // @ts-ignore
      expect(container.querySelector(".board").firstChild).toHaveClass("accent-color__blue");
    });

    test('right side-panel has correct accent color', () => {
      const { container } = render(createBoardWithColumns('blue', 'pink'));
      // @ts-ignore
      expect(container.querySelector(".board").lastChild).toHaveClass("accent-color__pink");
    });

    test('side-panels have correct accent color with single column', () => {
      const { container } = render(createBoardWithColumns('violet'));
      const board = container.querySelector(".board");
      // @ts-ignore
      expect(board.firstChild).toHaveClass("accent-color__violet");
      // @ts-ignore
      expect(board.lastChild).toHaveClass("accent-color__violet");
    });
  });
});

describe('navigation', () => {

  beforeEach(() => {
    window.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      disconnect: jest.fn()
    }) as any);
  });

  let intersectionObserver: any;

  beforeEach(() => {
    intersectionObserver = {
      observe: jest.fn(),
      disconnect: jest.fn()
    };
    window.IntersectionObserver = jest.fn(() => (intersectionObserver));
  })

  test('intersection observer is registered on mount', () => {
    render(createBoardWithColumns('violet', 'blue'));
    expect(window.IntersectionObserver).toHaveBeenCalled();
    expect(intersectionObserver.observe).toHaveBeenCalledTimes(2);
  });

  test('intersection observer is disconnected on unmount', () => {
    render(createBoardWithColumns('pink')).unmount();
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(1);
  });

  test('intersection observer is re-initialized on change of children', () => {
    const { rerender } = render(createBoardWithColumns('pink'));

    expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(0);

    rerender(createBoardWithColumns('pink', 'blue'));

    expect(window.IntersectionObserver).toHaveBeenCalledTimes(2);
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(1);
  });

  describe('buttons visibility and functionality', () => {

    let container: HTMLElement;

    beforeEach(() => {
      container = render(createBoardWithColumns('pink', 'blue', 'purple')).container;
    });

    const showColumns = (first: boolean, second: boolean, third: boolean) => {
      const columns = container.querySelectorAll('.column');
      act(() => {
        const firstMethodCall = 0;
        const firstMethodParameter = 0;

        const intersectionObserverCallback = (window.IntersectionObserver as any).mock.calls[firstMethodCall][firstMethodParameter];
        intersectionObserverCallback([
          { isIntersecting: first, target: columns[0] },
          { isIntersecting: second, target: columns[1] },
          { isIntersecting: third, target: columns[2] }
        ]);
      });
      return columns;
    }

    test('navigation is hidden when all columns are visible', () => {
      showColumns(true, true, true);
      expect(container.querySelector('.board__navigation')).not.toBeInTheDocument();
    });

    test('navigation is shown when some columns are outside of the viewport', () => {
      showColumns(false, true, false);
      expect(container.querySelector('.board__navigation')).toBeInTheDocument();
    });

    test('correct scroll of previous button', () => {
      const columns = showColumns(false, true, false);
      const scrollIntoView = jest.fn();
      columns[0].scrollIntoView = scrollIntoView;
      fireEvent.click(container.querySelector(".board__navigation-prev") as any);

      expect(scrollIntoView).toHaveBeenCalled();
    });

    test('correct scroll of next button', () => {
      const columns = showColumns(false, true, false);

      const scrollIntoView = jest.fn();
      columns[2].scrollIntoView = scrollIntoView;
      fireEvent.click(container.querySelector(".board__navigation-next") as any);

      expect(scrollIntoView).toHaveBeenCalled();
    });

    test('previous button has color of previous column', () => {
      showColumns(false, true, false);
      expect(container.querySelector('.board__navigation-prev')).toHaveClass('accent-color__pink');
    });

    test('next button has color of next column', () => {
      showColumns(false, true, false);
      expect(container.querySelector('.board__navigation-next')).toHaveClass('accent-color__purple');
    });
  })
});


describe('users', () => {

  const currentUser = {
    id: '@_online',
    displayName: 'Max Mustermann',
    admin: true,
    online: true
  }

  beforeEach(() => {
    const mockCurrentUser = jest.fn(() => currentUser);
    Parse.User.current = mockCurrentUser;
  });

  const NUM_OF_ONLINE_USERS = 10;
  const NUM_OF_OFFLINE_USERS = 10;
  const NUM_OF_DISPLAYED_USERS = 4;

  const bunchOfOnlineUsers = [...new Array(NUM_OF_ONLINE_USERS - 1)].map((_, i) => ({
    id: `${i}_online`,
    displayName: 'Max Mustermann',
    admin: (i%2===0)?true:false,
    online: true
  }));

  const bunchOfOfflineUsers = [...new Array(NUM_OF_OFFLINE_USERS)].map((_, i) => ({
    id: `${i}_offline`,
    displayName: 'Erika Musterfrau',
    admin: (i%2===0)?false:true,
    online: false
  }));

  const initialState = {
    users: {
      all: [
        currentUser,
        ...bunchOfOnlineUsers,
        ...bunchOfOfflineUsers
      ]
    }
  }


  test('only online users are shown', () => {
    const store = mockStore(initialState)
  
    const { container } = render(
      <Provider store={store}>
        <BoardUsers numOfUsersToShow={NUM_OF_DISPLAYED_USERS} />
      </Provider>
    );
    const utils = within(container);
    expect(utils.getAllByText('MM').length).toEqual(NUM_OF_DISPLAYED_USERS);
  });

  test('correct number of online users is shown', () => {
    const store = mockStore(initialState)
  
    const { container } = render(
      <Provider store={store}>
        <BoardUsers numOfUsersToShow={NUM_OF_DISPLAYED_USERS} />
      </Provider>
    );
    expect(container.querySelectorAll('.user-list li')).toHaveLength((NUM_OF_ONLINE_USERS <= NUM_OF_DISPLAYED_USERS + 1)?NUM_OF_ONLINE_USERS:NUM_OF_DISPLAYED_USERS + 1);
  });

  test('correct count of rest users is shown', () => {
    const store = mockStore(initialState)
  
    const { container } = render(
      <Provider store={store}>
        <BoardUsers numOfUsersToShow={NUM_OF_DISPLAYED_USERS} />
      </Provider>
    );

    expect(container.querySelector('.rest-users__count')).toHaveTextContent(`${NUM_OF_ONLINE_USERS - NUM_OF_DISPLAYED_USERS}`);
  });

});
