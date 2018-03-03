import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
const firebaseMock = require('react-redux-firebase');

import { ColumnType } from '../../constants/Retrospective';
import {
  AddCard,
  AddCardProps,
  AddCardState,
  AddCardTheme,
  OwnAddCardProps
} from './AddCard';
import { mapStateToProps } from './AddCard.container';
import { mockStoreState } from '../../builder';

const KEYCODE_ENTER = 13;

describe('<AddCard />', () => {
  describe('dumb component', () => {
    let wrapper: ShallowWrapper<AddCardProps, AddCardState>;
    let props: AddCardProps;

    beforeEach(() => {
      props = {
        boardId: 'boardId',
        type: 'positive',
        onAdd: jest.fn()
      };
    });

    xit('should pass theme prop to sub-component', () => {
      const theme: AddCardTheme = 'mint';
      wrapper = shallow(<AddCard {...props} />);
      expect(wrapper.prop('theme')).toEqual(theme);
    });

    it('should have an input box with correct value', () => {
      const text = 'foobar';
      wrapper = shallow(<AddCard {...props} />);

      let input = wrapper.find('Input');
      expect(input.prop('value')).toEqual('');

      input.simulate('change', { target: { value: text } });

      input = wrapper.find('Input');
      expect(input.prop('value')).toEqual(text);
      expect(wrapper.state().text).toEqual(text);
    });

    describe('add card via enter key', () => {
      const text = 'foobar';
      const type: ColumnType = 'negative';

      it('should not call onAdd callback when enter is not pressed', () => {
        wrapper = shallow(<AddCard {...props} />);
        wrapper.setState({ text });
        let input = wrapper.find('Input');

        expect(props.onAdd).not.toHaveBeenCalled();

        input.simulate('focus');
        input.simulate('keydown', { keyCode: 999 /* not enter key */ });

        expect(props.onAdd).not.toHaveBeenCalled();
      });

      it('should not call onAdd callback when no text is entered but enter button is pressed', () => {
        wrapper = shallow(<AddCard {...props} />);
        wrapper.setState({ text: '' });
        let input = wrapper.find('Input');

        expect(props.onAdd).not.toHaveBeenCalled();

        input.simulate('focus');
        input.simulate('keydown', { keyCode: KEYCODE_ENTER });

        expect(props.onAdd).not.toHaveBeenCalled();
      });

      it('should call onAdd callback when enter is pressed and text has been entered', () => {
        wrapper = shallow(<AddCard {...props} type={type} />);
        wrapper.setState({ text });
        let input = wrapper.find('Input');

        expect(props.onAdd).not.toHaveBeenCalled();

        input.simulate('focus');
        input.simulate('keydown', { keyCode: KEYCODE_ENTER });

        expect(props.onAdd).toHaveBeenCalledWith(type, text);
        expect(wrapper.state().text).toEqual('');
      });
    });

    describe('add card via button', () => {
      const text = 'foobar';
      const type: ColumnType = 'negative';

      it('should disable button if no text is entered', () => {
        wrapper = shallow(<AddCard {...props} />);
        const button = wrapper.find('button');
        expect(button.prop('disabled')).toBe(true);
      });

      it('should enable button if text has been entered', () => {
        wrapper = shallow(<AddCard {...props} />);
        wrapper.setState({ text });
        const button = wrapper.find('button');
        expect(button.prop('disabled')).toBe(false);
      });

      it('should call onAdd callback when button is pressed and text has been entered', () => {
        wrapper = shallow(<AddCard {...props} type={type} />);
        wrapper.setState({ text });

        expect(props.onAdd).not.toHaveBeenCalled();

        const button = wrapper.find('button');
        button.simulate('click');

        expect(props.onAdd).toHaveBeenCalledWith(type, text);
      });
    });
  });

  describe('mapStateToProps', () => {
    let ownProps: OwnAddCardProps;

    // TODO: Write a mock function for this after Johanns Definitions have been merged.
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
            config: {
              created: '2017-08-04T12:24:32.064Z',
              creatorUid: 'xNpM1E6XiigmfH7P8f42Vc3KyN02',
              guided: true,
              guidedPhase: 0,
              sorted: false,
              users: {
                xNpM1E6XiigmfH7P8f42Vc3KyN02: {
                  image:
                    'https://www.gravatar.com/avatar/3e046b237cd8b23336231b3c0a577e56?s=32&d=retro',
                  name: 'xx@xx.de',
                  ready: false
                }
              }
            }
          },
          '-AqhC0R4ywKluWRz0cZ8': {
            config: {
              created: '2017-08-04T12:24:32.064Z',
              creatorUid: 'xNpM1E6XiigmfH7P8f42Vc3KyN02',
              guided: true,
              guidedPhase: 0,
              sorted: false,
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
    };

    beforeEach(() => {
      const state = mockStoreState({ fbState });
      firebaseMock.__setState(state.fbState);
      ownProps = {
        boardId: 'boardId',
        type: 'positive'
      };
    });

    it('should push new card to firebase when onAdd is called', () => {
      const state = mockStoreState();
      const props = mapStateToProps(state, ownProps);
      const text = 'foobar';
      const timestamp = '2017-01-01T00:00:00.000Z';

      props.onAdd(ownProps.type, text, timestamp);
      const firebase = firebaseMock.getFirebase();

      expect(firebase.ref().push.mock.calls[0]).toMatchSnapshot();
    });
  });
});
