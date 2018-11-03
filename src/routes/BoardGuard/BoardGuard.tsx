import * as React from 'react';
import { getFirebase } from 'react-redux-firebase';
import { User } from 'firebase/app';
import { RouteComponentProps } from 'react-router';
// TODO: Types are not working with most recent version of Typescript.
// TODO: Use ES6 import if typings have been adjusted.
const { Redirect } = require('react-router-dom');

import Board, { BoardProps } from '../Board';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import * as firebase from 'firebase/app';
import DataSnapshot = firebase.database.DataSnapshot;

export interface BoardGuardProps extends RouteComponentProps<{ id: string }> {}

export interface BoardGuardState {
  boardSecuredReference: firebase.database.Reference | undefined;
  memberReference: firebase.database.Reference | undefined;
  authorizationReference: firebase.database.Reference | undefined;
  authStateHandle: firebase.Unsubscribe | undefined;

  isInvalidBoard: boolean | undefined;
  isSecuredBoard: boolean | undefined;
  isApplicantAuthorized: boolean | undefined;
  isMember: boolean | undefined;
  isAddedAsApplicant: boolean | undefined;
  isAddedAsMember: boolean | undefined;
  isAuthenticated: boolean | undefined;
}

export class BoardGuard extends React.Component<
  BoardGuardProps,
  BoardGuardState
> {
  state: BoardGuardState = {
    boardSecuredReference: undefined,
    memberReference: undefined,
    authorizationReference: undefined,
    authStateHandle: undefined,
    isInvalidBoard: undefined,
    isSecuredBoard: undefined,
    isApplicantAuthorized: undefined,
    isMember: undefined,
    isAddedAsApplicant: undefined,
    isAddedAsMember: undefined,
    isAuthenticated: undefined
  };

  isReady() {
    if (this.state.isMember) {
      return true;
    }
    return !!(
      this.state.isInvalidBoard !== undefined && !this.state.isInvalidBoard
    );
  }

  registerUserReferences(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;

    if (firebase.auth().currentUser) {
      const authorizationReference = firebase.ref(
        `/boards/${boardId}/public/accessAuthorized/${
          firebase.auth().currentUser!!.uid
        }`
      );
      const memberReference = firebase.ref(
        `/boards/${boardId}/private/members/${
          firebase.auth().currentUser!!.uid
        }`
      );

      this.setState({ memberReference, authorizationReference });

      authorizationReference.on(
        'value',
        (accessAuthorized: DataSnapshot) => {
          if (accessAuthorized.exists()) {
            this.setState({
              isApplicantAuthorized: accessAuthorized.val() as boolean
            });
          }
        },
        () => {
          this.setState({ isApplicantAuthorized: false });
        }
      );

      memberReference.on(
        'value',
        (memberReference: DataSnapshot) => {
          this.setState({ isMember: memberReference.exists() });
        },
        () => {
          this.setState({ isMember: false });
        }
      );
    } else {
      this.setState({ isMember: false });
    }
  }

  checkBoardReference(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;

    const boardSecuredReference = firebase.ref(
      `/boards/${boardId}/public/secure`
    );

    this.setState({ boardSecuredReference });

    boardSecuredReference.on(
      'value',
      (securedBoard: DataSnapshot) => {
        if (securedBoard.exists()) {
          this.setState({
            isInvalidBoard: false,
            isSecuredBoard: securedBoard.val()
          });
        } else {
          this.setState({ isInvalidBoard: true });
        }
      },
      () => {
        this.setState({ isInvalidBoard: true });
      }
    );
  }

  componentWillReceiveProps(nextProps: BoardGuardProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      if (this.state.boardSecuredReference) {
        this.state.boardSecuredReference.off();
      }
      if (this.state.authorizationReference) {
        this.state.authorizationReference.off();
      }
      if (this.state.memberReference) {
        this.state.memberReference.off();
      }

      this.setState(
        {
          boardSecuredReference: undefined,
          memberReference: undefined,
          authorizationReference: undefined,
          authStateHandle: undefined,
          isInvalidBoard: undefined,
          isSecuredBoard: undefined,
          isApplicantAuthorized: undefined,
          isMember: undefined,
          isAddedAsApplicant: undefined,
          isAddedAsMember: undefined
        },
        () => {
          this.checkBoardReference(nextProps.match.params.id);
        }
      );
    }
  }

  addAsMember(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;

    const user = firebase.auth().currentUser as User;

    firebase.ref(`/boards/${boardId}/private/members/${user.uid}`).set({
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    const onlineRef = firebase.ref(
      `/boards/${boardId}/private/online/${user.uid}`
    );
    const amOnline = firebase.ref('.info/connected');
    amOnline.on('value', (snapshot: any) => {
      if (snapshot.val()) {
        onlineRef.onDisconnect().remove();
        onlineRef.set(true);
      }
    });
  }

  addAsApplicant(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;
    const user = firebase.auth().currentUser as User;
    firebase.ref(`/boards/${boardId}/public/applicants/${user.uid}`).set({
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  }

  componentDidUpdate(prevProps: BoardGuardProps, prevState: BoardGuardState) {
    const boardId = this.props.match.params.id;

    if (this.state.isAuthenticated) {
      if (
        (!prevState.isApplicantAuthorized &&
          this.state.isApplicantAuthorized) ||
        ((prevState.isSecuredBoard === undefined || prevState.isSecuredBoard) &&
          !this.state.isSecuredBoard)
      ) {
        this.addAsMember(boardId);
      }
      if (
        !prevState.isSecuredBoard &&
        this.state.isSecuredBoard &&
        !this.state.isMember
      ) {
        this.addAsApplicant(boardId);
      }
    }

    if (!prevState.isAuthenticated && this.state.isAuthenticated) {
      this.registerUserReferences(this.props.match.params.id);

      if (
        this.state.isSecuredBoard !== undefined &&
        !this.state.isSecuredBoard
      ) {
        this.addAsMember(boardId);
      } else if (this.state.isSecuredBoard) {
        this.addAsApplicant(boardId);
      }
    }
  }

  componentDidMount() {
    this.checkBoardReference(this.props.match.params.id);

    this.setState({
      authStateHandle: getFirebase()
        .auth()
        .onAuthStateChanged(
          (user: User) => {
            // Test if user is authenticated.
            const authenticated = user !== null;
            // At this point firebase is ready.
            this.setState({ isAuthenticated: authenticated });
          },
          () => {
            this.setState({ isAuthenticated: false });
          }
        )
    });
  }

  componentWillUnmount() {
    if (this.state.boardSecuredReference) {
      this.state.boardSecuredReference.off();
    }
    if (this.state.authorizationReference) {
      this.state.authorizationReference.off();
    }
    if (this.state.memberReference) {
      this.state.memberReference.off();
    }
    if (this.state.authStateHandle) {
      this.state.authStateHandle();
    }
  }

  render() {
    const {
      isInvalidBoard,
      isApplicantAuthorized,
      isAuthenticated
    } = this.state;
    const url = window.location.href;

    if (
      isInvalidBoard ||
      (isApplicantAuthorized !== undefined && !isApplicantAuthorized)
    ) {
      return (
        <Redirect
          to={{
            pathname: '/new',
            state: { referrer: url }
          }}
        />
      );
    }

    const ready = this.isReady();
    if (!ready) {
      return <LoadingScreen />;
    }

    // In case user is not authenticated, redirect him to the login form, which will redirect him to the board
    // after user has been logged in successfully.
    if (isAuthenticated !== undefined && !isAuthenticated) {
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
