import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { Boards } from '../../types';
import { mapStateToProps } from './NewBoard.container';
import './NewBoard.css';
import { AuthProvider } from '../../constants/Auth';
import getRandomName from '../../constants/Name';
import ProviderLogin from '../../components/ProviderLogin/ProviderLogin';
import Input from '../../components/Input/Input';
import WelcomeArea from '../../components/WelcomeArea/WelcomeArea';
import { RetroMode } from '../../constants/mode';

export type OwnNewBoardProps = RouteComponentProps<{}>;

export interface StateNewBoardProps {
  uid: string | null;
  boards: Boards;
  onLogin: (name: string, mode: RetroMode) => void;
  onProviderLogin: (provider: AuthProvider) => () => void;
  onLogout: () => void;
  onCreateNewBoard: (mode: RetroMode) => void;
}

export type NewBoardProps = OwnNewBoardProps & StateNewBoardProps;

export interface NewBoardState {
  email: string;
}

export class NewBoard extends Component<NewBoardProps, NewBoardState> {
  defaultName: string;

  constructor(props: NewBoardProps) {
    super(props);

    this.defaultName = getRandomName();
    this.state = { email: this.defaultName };
  }

  handleChangeEmail = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const email = (e.target as HTMLInputElement).value;
    this.setState(state => ({ ...state, email }));
  };

  handleClickLogin = (mode: RetroMode) => {
    return () => this.props.onLogin(this.state.email, mode);
  };

  render() {
    const { uid } = this.props;
    return (
      <WelcomeArea>
        {!uid && (
          <div className="new-board__action-area-content">
            <div>
              <h1 className="new-board__action-area-header">Try it now!</h1>
            </div>
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
                    this.handleClickLogin('lean');
                  }
                }}
              />
            </div>
            <div>
              <button
                onClick={this.handleClickLogin('lean')}
                className="new-board__action-button"
              >
                Start Lean
              </button>
              <button
                onClick={this.handleClickLogin('startStopContinue')}
                className="new-board__action-button"
              >
                Start,Stop,Continue
              </button>
              <button
                onClick={this.handleClickLogin('positiveNegative')}
                className="new-board__action-button"
              >
                Start as usual
              </button>
              <ProviderLogin onProviderLogin={this.props.onProviderLogin} />
            </div>
          </div>
        )}
        {uid && (
          <div className="new-board__action-area-content">
            <div>
              <h1 className="new-board__action-area-header">Try it now!</h1>
              <p className="new-board__action-area-paragraph">
                Start your first online retrospective in a few seconds. No
                registration required - completely free.
              </p>
            </div>
            <button
              onClick={() => this.props.onCreateNewBoard('lean')}
              className="new-board__action-button"
            >
              Start Lean
            </button>
            <button
              onClick={() => this.props.onCreateNewBoard('startStopContinue')}
              className="new-board__action-button"
            >
              Start,Stop,Continue
            </button>
            <button
              onClick={() => this.props.onCreateNewBoard('positiveNegative')}
              className="new-board__action-button"
            >
              Start as usual
            </button>
            <button
              className="new-board__logout-btn"
              onClick={this.props.onLogout}
            >
              Log out
            </button>
          </div>
        )}
      </WelcomeArea>
    );
  }
}

export default connect(mapStateToProps)(NewBoard);
