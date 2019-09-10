import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { mapStateToProps } from './LoginBoard.container';
import './LoginBoard.scss';
import '../NewBoard/NewBoard.scss';
import { compose } from 'redux';
import { AuthProvider } from '../../constants/Auth';
import ProviderLogin from '../../components/ProviderLogin/ProviderLogin';
import getRandomName from '../../constants/Name';
import WelcomeArea from '../../components/WelcomeArea/WelcomeArea';
import Input from '../../components/Input/Input';

export interface LoginBoardProps extends RouteComponentProps<{}> {
  uid: string | null;
  onLogin: (name: string) => void;
  onProviderLogin: (provider: AuthProvider) => () => void;
  onLogout: () => void;
  onCreateNewBoard: () => void;

  [key: string]: any;
}

export interface LoginBoardState {
  email: string;
  error: boolean;
}

export class LoginBoard extends Component<LoginBoardProps, LoginBoardState> {
  defaultName: string;

  constructor(props: LoginBoardProps) {
    super(props);

    this.defaultName = getRandomName();
    this.state = { email: this.defaultName, error: false };
  }

  handleChangeEmail = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const email = (e.target as HTMLInputElement).value;
    this.setState(state => ({ ...state, email, error: /^\s/.test(email) }));
  };

  handleClickLogin = () => {
    if (!this.state.error) {
      this.props.onLogin(this.state.email);
    }
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
            <span>You were invited to join an online retrospective.</span>
            {uid && <span>Some people already joined the group …</span>}
            {!uid && (
              <span>
                {' '}
                Jump right into the action - no registration required,
                completely for free.
              </span>
            )}
          </p>

          {!uid && (
            <div>
              <Input
                type="text"
                label="Your name"
                placeholder={this.defaultName}
                focusTheme="mint"
                description="Choose a name by which you will be recognized"
                error={
                  this.state.error
                    ? 'Your name may not start with a whitespace'
                    : undefined
                }
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

export default compose(connect(mapStateToProps))(
  LoginBoard
) as React.ComponentClass<any>;
