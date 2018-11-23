import * as React from 'react';
import { getFirebase } from 'react-redux-firebase';
import { User } from 'firebase/app';
import { RouteComponentProps } from 'react-router';
import { Redirect } from 'react-router-dom';

import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import * as firebase from 'firebase/app';
import DataSnapshot = firebase.database.DataSnapshot;
import { CRYPTO } from '../../util/global';
import './BoardGuard.scss';

export interface BoardGuardProps extends RouteComponentProps<{ id: string }> {
  component: React.ComponentType<any>;
}

export interface BoardGuardState {
  isInvalidBoard?: boolean;
  isSecuredBoard?: boolean;
  isApplicantAuthorized?: boolean | undefined;
  isMember?: boolean;
  isAuthenticated?: boolean;
  isKeyImported?: boolean;

  // wait until member is added synchronously on the database, otherwise
  // can't proceed, because user won't have permissions to read data
  isAddingMember?: boolean;
}

export class BoardGuard extends React.PureComponent<
  BoardGuardProps,
  BoardGuardState
> {
  state: BoardGuardState = {};

  currentBoardId: string;

  boardConfigReference: firebase.database.Reference;
  memberReference: firebase.database.Reference;
  authorizationReference: firebase.database.Reference;
  keyReference: firebase.database.Reference;
  authStateHandle: firebase.Unsubscribe;
  crypto: Crypto;

  isReady() {
    if (this.state.isAuthenticated === undefined) {
      return false;
    }

    const isMember = Boolean(!this.state.isAddingMember && this.state.isMember);
    if (isMember) {
      const firebase = getFirebase() as firebase.app.App &
        firebase.database.Database;
      const boardId = this.currentBoardId;
      const user = firebase.auth().currentUser as User;

      if (this.state.isSecuredBoard) {
        this.keyReference = firebase.ref(
          `/boards/${boardId}/private/keyStore/${CRYPTO.getPublicKey()}`
        );

        this.keyReference.on(
          'value',
          (key: DataSnapshot) => {
            if (key.exists() && !!key.val()) {
              CRYPTO.importSymmetricKey(key.val()).then(() => {
                this.setState({ isKeyImported: true });
              });
            }
          },
          () => {
            this.setState({ isKeyImported: false });
          }
        );
      } else if (!this.state.isKeyImported) {
        this.setState({ isKeyImported: true });
      }

      // add presence link
      if (this.state.isKeyImported) {
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
      } else {
        return false;
      }
    }
    return isMember;
  }

  reinitializeMemberReference(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;

    if (firebase.auth().currentUser) {
      this.memberReference = firebase.ref(
        `/boards/${boardId}/private/users/${firebase.auth().currentUser!!.uid}`
      );

      this.memberReference.on(
        'value',
        (memberReference: DataSnapshot) => {
          this.setState({
            isMember: memberReference.exists() && !!memberReference.val()
          });
        },
        () => {
          this.setState({ isMember: false });
        }
      );
    }
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

      this.reinitializeMemberReference(boardId);

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
            isSecuredBoard: securedBoard.val().secure
          });
          CRYPTO.setActive(securedBoard.val().secure);
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
          name: user.displayName || '', // FIXME
          image: user.photoURL,
          publicKey: CRYPTO.getPublicKey()
        })
        .then(() => {
          this.setState({ isAddingMember: false });
        });
    });
  }

  addAsApplicant(boardId: string) {
    const firebase = getFirebase() as firebase.app.App &
      firebase.database.Database;
    const user = firebase.auth().currentUser as User;

    firebase.ref(`/boards/${boardId}/public/applicants/${user.uid}`).set({
      name: user.displayName || '', // FIXME
      image: user.photoURL
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
    this.currentBoardId = boardId;

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
        this.registerUserReferences(this.currentBoardId);
      }

      // add is member if authorized or board became public
      if (
        (!prevState.isApplicantAuthorized &&
          this.state.isApplicantAuthorized) ||
        ((prevState.isSecuredBoard === undefined || prevState.isSecuredBoard) &&
          this.state.isSecuredBoard !== undefined &&
          !this.state.isSecuredBoard)
      ) {
        setTimeout(() => {
          this.addAsMember(boardId);
          this.reinitializeMemberReference(boardId);
        }, 0);
      }

      // add as applicant if board is secured
      if (
        (!prevState.isSecuredBoard !== this.state.isSecuredBoard ||
          !prevState.isMember !== this.state.isMember) &&
        this.state.isSecuredBoard &&
        this.state.isMember !== undefined &&
        !this.state.isMember
      ) {
        setTimeout(() => this.addAsApplicant(boardId), 0);
      }
    }
  }

  componentDidMount() {
    this.currentBoardId = this.props.match.params.id;

    CRYPTO.initKeypair().then(() => {
      this.checkBoardReference(this.currentBoardId);

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
    });
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
    const boardId = this.props.match.params.id;

    if (isInvalidBoard) {
      return (
        <Redirect
          to={{
            pathname: '/new',
            state: { referrer: url }
          }}
        />
      );
    }

    if (isApplicantAuthorized !== undefined && !isApplicantAuthorized) {
      const DeniedMessage = (
        <>
          <p>Access denied by the board administrator</p>
          <a href="/" className="board-guard__denied-link">
            Return to homepage
          </a>
        </>
      );

      return <LoadingScreen status={DeniedMessage} />;
    }

    // In case user is not authenticated, redirect him to the login form, which will redirect him to the board
    // after user has been logged in successfully.
    if (isAuthenticated !== undefined && !isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: `/join/${boardId}`,
            state: { referrer: url }
          }}
        />
      );
    }

    const ready = this.isReady();
    if (!ready || boardId !== this.currentBoardId) {
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
      } else if (this.state.isKeyImported) {
        status = 'Checking encryption key';
      }

      return <LoadingScreen status={status} />;
    }

    const WrappedComponent = this.props.component;
    return <WrappedComponent {...this.props} />;
  }
}

export default BoardGuard;
