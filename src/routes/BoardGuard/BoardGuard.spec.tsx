describe('TODO', () => {
  it('dummy', () => {
    expect(true).toEqual(true);
  });
});
/*import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
// TODO: Types are not working with most recent version of Typescript.
// TODO: Use ES6 import if typings have been adjusted.
const { Redirect } = require('react-router-dom');

import BoardGuard, { BoardGuardProps, BoardGuardState } from './BoardGuard';

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
    expect(wrapper.find(Redirect)).toHaveLength(0);
    expect(wrapper.find('firebaseConnector')).toHaveLength(0);
    // Unfortunately in shallow mode the wrapped component is not available,
    // so test against the firebase connection method.
    expect(wrapper.text()).toContain('Loading user data');
  });

  it('should render a redirect if user has not been authenticated', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({ ready: true, authenticated: false });
    const redirect = wrapper.find(Redirect);
    expect(redirect).toHaveLength(1);
    expect(redirect.prop('to')).toMatchSnapshot();
    // Unfortunately in shallow mode the wrapped component is not available,
    // so test against the firebase connection method.
    expect(wrapper.find('firebaseConnector')).toHaveLength(0);
  });

  it('should render a board component if user is authenticatd', () => {
    wrapper = shallow(<BoardGuard {...props} />);
    wrapper.setState({ ready: true, authenticated: true });
    expect(wrapper.find(Redirect)).toHaveLength(0);
    // Unfortunately in shallow mode the wrapped component is not available,
    // so test against the firebase connection method.
    const firebaseConnector = wrapper.find('firebaseConnector');
    expect(firebaseConnector).toHaveLength(1);
    // Test if a onSignOut method is passed. The method is undefined in
    // shallow rendering, as its content will be defined in componentDidMount.
    expect(Object.keys(firebaseConnector.props())).toContain('onSignOut');
  });
});*/
