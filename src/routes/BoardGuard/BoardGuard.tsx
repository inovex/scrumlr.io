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
    if (this.state.isAuthenticated === undefined) {
      return false;
    }
    if (!this.state.isAddingMember && this.state.isMember) {
      return true;
    }
    return true;
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
          const presenceIndicatorReference = firebase.ref(
            `/boards/${boardId}/private/presence/${user.uid}`
          );
          const whileOnlineReference = firebase.ref('.info/connected');
          whileOnlineReference.on('value', (snapshot: any) => {
            if (snapshot.val()) {
              presenceIndicatorReference.onDisconnect().remove();
              presenceIndicatorReference.set(true);
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

  removeReferences() {
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

  componentDidUpdate(prevProps: BoardGuardProps, prevState: BoardGuardState) {
    const boardId = this.props.match.params.id;

    if (boardId !== prevProps.match.params.id) {
      this.removeReferences();
      this.setState(
        {
          isInvalidBoard: undefined,
          isSecuredBoard: undefined,
          isApplicantAuthorized: undefined,
          isMember: undefined
        },
        () => {
          this.checkBoardReference(boardId);
        }
      );
    } else if (this.state.isAuthenticated) {
      if (!prevState.isAuthenticated) {
        this.registerUserReferences(this.props.match.params.id);
      }

      // add is member if authorized or board became public
      if (
        (!prevState.isApplicantAuthorized &&
          this.state.isApplicantAuthorized) ||
        ((prevState.isSecuredBoard === undefined || prevState.isSecuredBoard) &&
          !this.state.isSecuredBoard)
      ) {
        setTimeout(() => this.addAsMember(boardId), 0);
      }

      // add as applicant if board is secured
      if (
        !prevState.isSecuredBoard &&
        this.state.isSecuredBoard &&
        !this.state.isMember
      ) {
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
          this.setState({ isAuthenticated: user !== null });
        },
        () => {
          this.setState({ isAuthenticated: false });
        }
      );
  }

  componentWillUnmount() {
    this.removeReferences();
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
      let status: string | undefined = undefined;
      if (this.state.isAddingMember) {
        status = 'Registering as board member';
      } else if (
        this.state.isSecuredBoard &&
        !this.state.isApplicantAuthorized
      ) {
        status = 'Waiting for board admin approval';
      } else if (this.state.isAuthenticated === undefined) {
        status = 'Authentication in progress';
      }

      return <LoadingScreen status={status} />;
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
