import { get } from 'lodash';
const mod: any = jest.genMockFromModule('react-redux-firebase');

let _state = Object.create(null);

function setState(state: object) {
  _state = { ...state };
}
mod.__setState = setState;

mod.__signInAnonymously = jest
  .fn()
  .mockReturnValue(Promise.resolve({ ..._state.auth }));
mod.__signOut = jest.fn().mockReturnValue(Promise.resolve());
mod.__updateProfile = jest.fn().mockReturnValue(Promise.resolve());

function auth() {
  return {
    currentUser: {
      updateProfile: mod.__updateProfile,
      ..._state.auth
    },
    signInAnonymously: mod.__signInAnonymously,
    signOut: mod.__signOut
  };
}

mod.__ref__push = jest.fn().mockReturnValue(Promise.resolve());

function ref() {
  return {
    push: mod.__ref__push
  };
}

mod.getFirebase = jest.fn().mockReturnValue({
  auth,
  ref
});

function getVal(state: any, path: string, defaultValue: any) {
  const selector = (path.substring(0, 1) === '/'
    ? path.substring(1)
    : path).replace('/', '.');
  return get(_state, selector, defaultValue);
}

mod.getVal = getVal;

mod.firebaseConnect = jest.fn((cmp: any) => {
  return () => cmp;
});

module.exports = mod;
