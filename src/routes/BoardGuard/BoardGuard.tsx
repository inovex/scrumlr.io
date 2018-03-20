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
  /** Value may change once board is deleted and reference is invalid. */
  invalidReference: boolean;
}

export class BoardGuard extends React.Component<
  BoardGuardProps,
  BoardGuardState
> {
  state: BoardGuardState = {
    ready: false,
    authenticated: false,
    invalidReference: false
  };

  componentWillMount() {
    // add callback for board deletion
    const boardId = this.props.match.params.id;
    getFirebase()
      .ref(`/boards/${boardId}/config/creatorUid`)
      .on('value', (snapshot: any) => {
        if (!snapshot.exists()) {
          this.setState({ ...this.state, invalidReference: true });
        }
      });
  }

  componentDidMount() {
    getFirebase()
      .auth()
      .onAuthStateChanged((user: User) => {
        // Test if user is authenticated.
        const authenticated = user !== null;
        if (authenticated) {
          // Log user presence.
          // For details see: https://firebase.googleblog.com/2013/06/how-to-build-presence-system.html
          const userRef = getFirebase().ref(`/presence/${user.uid}`);
          const amOnline = getFirebase().ref('.info/connected');
          console.log('userRef', userRef, amOnline);
          amOnline.on('value', (snapshot: any) => {
            if (snapshot.val()) {
              userRef.onDisconnect().remove((err: any) => console.log(err));
              userRef.set(true);
            }
          });
        }

        // At this point firebase is ready.
        this.setState({ ready: true, authenticated });
      });
  }

  render() {
    const { ready, authenticated, invalidReference } = this.state;
    const url = window.location.href;

    if (invalidReference) {
      return (
        <Redirect
          to={{
            pathname: '/new',
            state: { referrer: url }
          }}
        />
      );
    }

    if (!ready) {
      return <LoadingScreen />;
    }

    // In case user is not authenticated, redirect him to the login form, which will redirect him to the board
    // after user has been logged in successfully.
    if (!authenticated) {
      const boardId = this.props.match.params.id;
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
      ...this.props
    };
    return <Board {...props} />;
  }
}

export default BoardGuard;
