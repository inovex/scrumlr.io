import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
// TODO: Types are not working with most recent version of Typescript.
// TODO: Use ES6 import if typings have been adjusted.
const { Redirect } = require('react-router-dom');

import BoardGuard, { BoardGuardProps, BoardGuardState } from './BoardGuard';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

jest.mock('!svg-inline-loader!./logo.svg', () => 'svg', {
  virtual: true
});
jest.mock('!svg-inline-loader!./logo-s.svg', () => 'svg', {
  virtual: true
});
jest.mock('react-redux-firebase', () => ({
  getFirebase: () => ({
    ref: () => ({
      on: () => jest.fn()
    })
  }),
  firebaseConnect: () => () => jest.fn(),
  helpers: {
    isLoaded: () => jest.fn()
  }
}));

describe('<BoardGuard />', () => {
  let wrapper: ShallowWrapper<BoardGuardProps, BoardGuardState>;
  let props: BoardGuardProps;

  beforeEach(() => {
    props = {
      match: {
        params: { id: '-foobar' },
        isExact: true,
        path: '/boards/:id',
        url: '/boards/-foobar'
      },
      location: {
        state: {
          referrer: 'http://example.com/some/url'
        }
      } as any,
      history: null as any
    };
  });

  it('should render loading screen by default', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    expect(wrapper.find(LoadingScreen)).toHaveLength(1);
  });

  it('should render a redirect if user has not been authenticated', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({ ready: true, authenticated: false });
    const redirect = wrapper.find(Redirect);
    expect(redirect).toHaveLength(1);
    expect(redirect.prop('to')).toMatchSnapshot();
  });

  it('should render a board component if user is authenticated', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({ ready: true, authenticated: true });
    wrapper.update();
    expect(wrapper.find(LoadingScreen)).toHaveLength(0);
    expect(wrapper.find(Redirect)).toHaveLength(0);
  });
});
