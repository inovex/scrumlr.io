import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';

import { mockStoreState } from '../../builder';
import { StoreState } from '../../types';
import { NewBoard, NewBoardProps } from './NewBoard';
import { mapStateToProps } from './NewBoard.container';
import Input from '../../components/Input';
import { RetroMode } from '../../constants/mode';
import StartButton from '../../components/StartButton';
const firebaseMock = require('react-redux-firebase');

const fbState = {
  auth: {
    uid: 'xNpM1E6XiigmfH7P8f42Vc3KyN02',
    displayName: 'somebody@example.com',
    photoURL:
      'https://www.gravatar.com/avatar/3e046b237bd8b23336231b3c0a577e56?s=32&d=retro',
    email: 'somebody@example.com',
    emailVerified: false,
    identifierNumber: null,
    isAnonymous: true,
    providerData: [],
    apiKey: 'someApiKey',
    appName: '[DEFAULT]',
    authDomain: 'somedomain.firebaseapp.com',
    redirectEventId: null
  },
  data: {
    boards: {
      '-KqhC0R4ywKluWRz0cZ8': {
        private: {
          config: {
            created: '2017-08-04T12:24:32.064Z',
            creatorUid: 'xNpM1E6XiigmfH7P8f42Vc3KyN02',
            guided: true,
            guidedPhase: 0,
            sorted: false,
            mode: 'positiveNegative' as RetroMode,
            users: {
              xNpM1E6XiigmfH7P8f42Vc3KyN02: {
                image:
                  'https://www.gravatar.com/avatar/3e046b237cd8b23336231b3c0a577e56?s=32&d=retro',
                name: 'xx@xx.de',
                ready: false
              }
            }
          }
        }
      },
      '-AqhC0R4ywKluWRz0cZ8': {
        private: {
          config: {
            created: '2017-08-04T12:24:32.064Z',
            creatorUid: 'xNpM1E6XiigmfH7P8f42Vc3KyN02',
            guided: true,
            guidedPhase: 0,
            sorted: false,
            mode: 'positiveNegative' as RetroMode,
            users: {
              xNpM1E6XiigmfH7P8f42Vc3KyN02: {
                image:
                  'https://www.gravatar.com/avatar/3e046b237cd8b23336231b3c0a577e56?s=32&d=retro',
                name: 'xx@xx.de',
                ready: false
              }
            }
          }
        }
      }
    }
  }
};

describe('<NewBoard />', () => {
  describe('mapStateToProps', () => {
    let state: StoreState;
    let ownProps: NewBoardProps;

    beforeEach(() => {
      state = mockStoreState({ fbState });
      firebaseMock.__setState(state.fbState);
      ownProps = {
        location: {
          state: {
            referrer: 'http://example.com/some/url'
          }
        }
      } as NewBoardProps;
    });

    it('should list all available boards', () => {
      const result = mapStateToProps(state, ownProps);
      expect(result.boards).toMatchSnapshot();
    });

    it('should get current user id', () => {
      const result = mapStateToProps(state, ownProps);
      expect(result.uid).toBe('xNpM1E6XiigmfH7P8f42Vc3KyN02');
    });

    // FIXME this test doesnt work with travis
    xit('should login user correctly', () => {
      const result = mapStateToProps(state, ownProps);
      const email = 'me@example.com';
      result.onLogin(email, 'positiveNegative');
      const firebase = firebaseMock.getFirebase();
      expect(firebase.auth().signInAnonymously).toBeCalled();
      // TODO: can this be tested somehow?
      // expect(firebase.auth().currentUser.updateProfile).toBeCalled();
    });

    it('should sign out user correclty', () => {
      const result = mapStateToProps(state, ownProps);
      result.onLogout();
      const firebase = firebaseMock.getFirebase();
      expect(firebase.auth().signOut).toBeCalled();
    });
  });

  describe('dumb component', () => {
    let props: NewBoardProps;
    let shallowWrapper: ShallowWrapper<NewBoardProps, {}>;

    beforeEach(() => {
      props = {
        uid: null,
        boards: {},
        onLogin: jest.fn(),
        onProviderLogin: jest.fn(),
        onLogout: jest.fn(),
        onCreateNewBoard: jest.fn(),

        match: {
          params: {},
          isExact: true,
          path: '/new',
          url: '/new'
        },
        location: {
          state: {
            referrer: 'http://example.com/some/url'
          }
        } as any,
        history: null as any
      };
    });

    it('should not show the logout button if uid is falsy', () => {
      const uid = null;
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);
      const result = shallowWrapper.find('button.init-board__logout-btn');
      expect(result).toHaveLength(0);
    });

    it('should not show the logout button if uid is truthy', () => {
      const uid = 'someId';
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);
      const result = shallowWrapper.find('.new-board__logout-btn');
      expect(result).toHaveLength(1);
    });

    it('should trigger onLogout method if logout button is clicked', () => {
      const uid = 'someId';
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);
      shallowWrapper.find('.new-board__logout-btn').simulate('click');
      expect(props.onLogout).toBeCalled();
    });

    it('should show email field if user is not logged in', () => {
      const uid = null;
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);
      expect(shallowWrapper.find(Input)).toHaveLength(1);
    });

    it('should not show email field if user is logged in', () => {
      const uid = 'myUserId';
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);
      expect(shallowWrapper.find(Input)).toHaveLength(0);
    });

    it('should show login button if user is not logged in', () => {
      const uid = null;
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);

      const btn = shallowWrapper.find(StartButton);
      expect(btn.text()).toMatchSnapshot();
    });

    it('should show create board button if user is logged in', () => {
      const uid = 'myUserId';
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);

      const btn = shallowWrapper.find(StartButton);
      expect(btn.text()).toMatchSnapshot();
    });

    it('should update state if email address is entered', () => {
      const uid = null;
      shallowWrapper = shallow(<NewBoard {...props} uid={uid} />);

      //expect(shallowWrapper.instance().state).toEqual({ email: '' });

      shallowWrapper
        .find(Input)
        .simulate('change', { target: { value: 'abc' } });
      expect(shallowWrapper.instance().state).toEqual({ email: 'abc' });
    });
  });
});
