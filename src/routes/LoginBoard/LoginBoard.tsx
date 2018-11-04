import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { Boards, BoardUsers } from '../../types';
import { mapStateToProps } from './LoginBoard.container';
import './LoginBoard.css';
import '../NewBoard/NewBoard.css';
import UserList from '../../components/UserList/UserList';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { AuthProvider } from '../../constants/Auth';
import ProviderLogin from '../../components/ProviderLogin/ProviderLogin';
import getRandomName from '../../constants/Name';
import WelcomeArea from '../../components/WelcomeArea/WelcomeArea';
import Input from '../../components/Input/Input';

export interface LoginBoardProps extends RouteComponentProps<{}> {
  uid: string | null;
  boards: Boards;
  onLogin: (name: string) => void;
  onProviderLogin: (provider: AuthProvider) => () => void;
  onLogout: () => void;
  onCreateNewBoard: () => void;
  users: BoardUsers;
  name?: string;

  [key: string]: any;
}

export interface LoginBoardState {
  email: string;
}

export class LoginBoard extends Component<LoginBoardProps, LoginBoardState> {
  defaultName: string;

  constructor(props: LoginBoardProps) {
    super(props);

    this.defaultName = getRandomName();
    this.state = { email: this.defaultName };
  }

  handleChangeEmail = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const email = (e.target as HTMLInputElement).value;
    this.setState(state => ({ ...state, email }));
  };

  handleClickLogin = () => {
    this.props.onLogin(this.state.email);
  };

  render() {
    const { uid } = this.props;
    return (
      <WelcomeArea>
        <div className="new-board__action-area-content">
          <h1 className="new-board__action-area-header">
            {!uid && <span>Hi, nice to meet you!</span>}
            {uid && <span>Welcome back!</span>}
          </h1>

          <p className="new-board__action-area-paragraph">
            {this.props.name && (
              <span>
                You were invited to join the online retrospective{' '}
                <strong>{this.props.name}</strong>.
              </span>
            )}
            {!this.props.name && (
              <span>You were invited to join an online retrospective.</span>
            )}
            {uid && (
              <span> These participants are already waiting for you …</span>
            )}
            {!uid && (
              <span>
                {' '}
                Jump right into the action - no registration required,
                completely for free.
              </span>
            )}
          </p>

          {uid && (
            <div className="login-board__user-list">
              <UserList
                currentUserId={uid || ''}
                users={this.props.users}
                onToggleReadyState={() => {}}
                userDisplayLimit={4}
              />
            </div>
          )}

          {!uid && (
            <div>
              <Input
                type="text"
                label="Your name"
                placeholder={this.defaultName}
                focusTheme="mint"
                description="Choose a name by which you will be recognized"
                className="new-board__input"
                onChange={this.handleChangeEmail}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.keyCode === 13) {
                    this.handleClickLogin();
                  }
                }}
              />
              <button
                onClick={this.handleClickLogin}
                className="new-board__action-button"
              >
                Join
              </button>
            </div>
          )}
          {!uid && (
            <ProviderLogin onProviderLogin={this.props.onProviderLogin} />
          )}
          {uid && (
            <button
              onClick={this.handleClickLogin}
              className="new-board__action-button"
            >
              Join
            </button>
          )}
        </div>
      </WelcomeArea>
    );
  }
}

function firebaseConnector(props: RouteComponentProps<{ id: string }>) {
  return [`/boards/${props.match.params.id}/private/config`];
}

export default compose(
  firebaseConnect(firebaseConnector),
  connect(mapStateToProps)
)(LoginBoard) as React.ComponentClass<any>;
