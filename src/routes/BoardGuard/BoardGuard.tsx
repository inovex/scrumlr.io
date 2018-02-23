import * as React from 'react';
import { getFirebase } from 'react-redux-firebase';
import { User } from 'firebase';
import { RouteComponentProps } from 'react-router';
// TODO: Types are not working with most recent version of Typescript.
// TODO: Use ES6 import if typings have been adjusted.
const { Redirect } = require('react-router-dom');

import Board, { BoardProps } from '../Board';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

export interface BoardGuardProps extends RouteComponentProps<{ id: string }> {}

export interface BoardGuardState {
  /** If firebase is ready and user data has been loaded this flag is true. */
  ready: boolean;
  /** If the current user is authenticated this flag will be true. */
  authenticated: boolean;
  /** Refers to the unsubscribe callback of firebase auth state change event. */
  unsubscribeAuthStateChange: (() => void) | undefined;
}

export class BoardGuard extends React.Component<
  BoardGuardProps,
  BoardGuardState
> {
  state: BoardGuardState = {
    ready: false,
    authenticated: false,
    unsubscribeAuthStateChange: undefined
  };

  componentDidMount() {
    const unsubscribeAuthStateChange = getFirebase()
      .auth()
      .onAuthStateChanged((user: User) => {
        // Test if user is authenticated.
        const authenticated = user !== null;
        if (authenticated) {
          // Log user presence.
          // For details see: https://firebase.googleblog.com/2013/06/how-to-build-presence-system.html
          const userRef = getFirebase().ref(`/presence/${user.uid}`);
          const amOnline = getFirebase().ref('.info/connected');
          amOnline.on('value', (snapshot: any) => {
            if (snapshot.val()) {
              userRef.onDisconnect().remove();
              userRef.set(true);
            }
          });
        }

        // At this point firebase is ready.
        this.setState(state => ({ ...state, ready: true, authenticated }));
      });
    this.setState(state => ({ ...state, unsubscribeAuthStateChange }));
  }

  componentWillUnmount() {
    // Unsubscribe from authentication state change handler.
    // This is necessary in case the user is not authenticated and will be redirected to the login form.
    const { unsubscribeAuthStateChange } = this.state;
    if (typeof unsubscribeAuthStateChange === 'function') {
      unsubscribeAuthStateChange();
    }
  }

  render() {
    const { ready, authenticated, unsubscribeAuthStateChange } = this.state;
    // const { id } = this.props.match.params;
    if (!ready) {
      return <LoadingScreen />;
    }

    // In case user is not authenticated, redirect him to the login form, which will redirect him to the board
    // after user has been logged in successfully.
    if (!authenticated) {
      const url = window.location.href;
      const boardId = url.substr(url.lastIndexOf('/') + 1);

      return (
        <Redirect
          to={{
            pathname: `/join/${boardId}`,
            state: { referrer: url }
          }}
        />
      );
    }

    // If the user is logged in render the board page.
    const props: Partial<BoardProps> = {
      ...this.props,
      onSignOut: unsubscribeAuthStateChange
    };
    return <Board {...props} />;
  }
}

export default BoardGuard;
