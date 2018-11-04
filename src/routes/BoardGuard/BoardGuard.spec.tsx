import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Redirect } from 'react-router-dom';

import BoardGuard, { BoardGuardProps, BoardGuardState } from './BoardGuard';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

jest.mock('react-redux-firebase', () => ({
  getFirebase: () => ({
    ref: () => ({
      on: () => jest.fn()
    }),
    auth: () => ({
      onAuthStateChanged: () => jest.fn()
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
    wrapper.setState({
      isAuthenticated: false
    });
    wrapper.update();
    const redirect = wrapper.find(Redirect);
    expect(redirect.length).toEqual(1);
    expect(redirect.prop('to')).toMatchSnapshot();
  });

  it('should render a board component if user is authenticated', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({
      isAuthenticated: true,
      isMember: true
    });
    wrapper.update();
    expect(wrapper.find(LoadingScreen)).toHaveLength(0);
    expect(wrapper.find(Redirect)).toHaveLength(0);
  });

  it('should redirect to homepage if board is invalid', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({
      isInvalidBoard: true
    });
    wrapper.update();
    const redirect = wrapper.find(Redirect);
    expect(redirect.length).toEqual(1);
    expect(redirect.prop('to')).toMatchSnapshot();
  });

  it('should redirect to homepage if access is denied', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({
      isApplicantAuthorized: false
    });
    wrapper.update();
    const redirect = wrapper.find(Redirect);
    expect(redirect.length).toEqual(1);
    expect(redirect.prop('to')).toMatchSnapshot();
  });
});
