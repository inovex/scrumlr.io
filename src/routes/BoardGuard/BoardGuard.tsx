import * as React from 'react';
import { getFirebase } from 'react-redux-firebase';
import { User } from 'firebase/app';
import { RouteComponentProps } from 'react-router';
import { Redirect } from 'react-router-dom';

import Board, { BoardProps } from '../Board';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import * as firebase from 'firebase/app';
import DataSnapshot = firebase.database.DataSnapshot;
import { Chiffre } from '../../util/encrypt';

export interface BoardGuardProps extends RouteComponentProps<{ id: string }> {}

export interface BoardGuardState {
  isInvalidBoard?: boolean;
  isSecuredBoard?: boolean;
  isApplicantAuthorized?: boolean;
  isMember?: boolean;
  isAuthenticated?: boolean;

  publicKey?: string;

  // wait until member is added synchronously on the database, otherwise
  // can't proceed, because user won't have permissions to read data
  isAddingMember?: boolean;
}

export class BoardGuard extends React.Component<
  BoardGuardProps,
  BoardGuardState
> {
  state: BoardGuardState = {};

  boardConfigReference: firebase.database.Reference;
  memberReference: firebase.database.Reference;
  authorizationReference: firebase.database.Reference;
  authStateHandle: firebase.Unsubscribe;

  isReady() {
    if (!this.state.isAddingMember && this.state.isMember) {
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
      this.authorizationReference = firebase.ref(
        `/boards/${boardId}/public/accessAuthorized/${
          firebase.auth().currentUser!!.uid
        }`
      );
      this.memberReference = firebase.ref(
        `/boards/${boardId}/private/users/${firebase.auth().currentUser!!.uid}`
      );

      this.authorizationReference.on(
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

      this.memberReference.on(
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

    this.boardConfigReference = firebase.ref(
      `/boards/${boardId}/public/config`
    );

    this.boardConfigReference.on(
      'value',
      (securedBoard: DataSnapshot) => {
        if (securedBoard.exists()) {
          this.setState({
            isInvalidBoard: false,
            isSecuredBoard: securedBoard.val().secure,
            publicKey: securedBoard.val().key
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
      if (this.boardConfigReference) {
        this.boardConfigReference.off();
      }
      if (this.authorizationReference) {
        this.authorizationReference.off();
      }
      if (this.memberReference) {
        this.memberReference.off();
      }

      this.setState(
        {
          isInvalidBoard: undefined,
          isSecuredBoard: undefined,
          isApplicantAuthorized: undefined,
          isMember: undefined
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

    this.setState({ isAddingMember: true }, () => {
      const user = firebase.auth().currentUser as User;
      firebase
        .ref(`/boards/${boardId}/private/users/${user.uid}`)
        .set({
          name: user.displayName,
          image: user.photoURL
        })
        .then(() => {
          const onlineRef = firebase.ref(
            `/boards/${boardId}/private/presence/${user.uid}`
          );
          const amOnline = firebase.ref('.info/connected');
          amOnline.on('value', (snapshot: any) => {
            if (snapshot.val()) {
              onlineRef.onDisconnect().remove();
              onlineRef.set(true);
            }
          });

          this.setState({ isAddingMember: false });
        });
    });
  }

  addAsApplicant(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;
    const user = firebase.auth().currentUser as User;

    let displayName = user.displayName || ''; // FIXME
    let photoURL = user.photoURL;
    if (this.state.publicKey) {
      const chiffre = new Chiffre({ publicKey: this.state.publicKey });
      displayName = chiffre.encrypt(displayName);
      if (photoURL) {
        photoURL = chiffre.encrypt(photoURL);
      }
    }

    firebase.ref(`/boards/${boardId}/public/applicants/${user.uid}`).set({
      displayName,
      photoURL
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
        setTimeout(() => this.addAsMember(boardId), 0);
      }
      if (
        !prevState.isSecuredBoard &&
        this.state.isSecuredBoard &&
        !this.state.isMember
      ) {
        setTimeout(() => this.addAsApplicant(boardId), 0);
      }
    }

    if (!prevState.isAuthenticated && this.state.isAuthenticated) {
      this.registerUserReferences(this.props.match.params.id);

      if (
        this.state.isSecuredBoard !== undefined &&
        !this.state.isSecuredBoard
      ) {
        setTimeout(() => this.addAsMember(boardId), 0);
      } else if (this.state.isSecuredBoard) {
        setTimeout(() => this.addAsApplicant(boardId), 0);
      }
    }
  }

  componentDidMount() {
    this.checkBoardReference(this.props.match.params.id);

    this.authStateHandle = getFirebase()
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
      );
  }

  componentWillUnmount() {
    if (this.boardConfigReference) {
      this.boardConfigReference.off();
    }
    if (this.authorizationReference) {
      this.authorizationReference.off();
    }
    if (this.memberReference) {
      this.memberReference.off();
    }
    if (this.authStateHandle) {
      this.authStateHandle();
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
