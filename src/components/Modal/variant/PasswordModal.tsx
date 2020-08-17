import * as React from 'react';

import './AccountTransferModal.scss';
import Modal from '../Modal';
import Input from '../../Input';
import { CRYPTO } from '../../../util/global';
import { AuthProvider } from '../../../constants/Auth';
import ProviderLogin from '../../ProviderLogin/ProviderLogin';

export interface PasswordModalProps {
  credentials: string;
  onClose: () => void;
  uid: string | null;
  onProviderLogin: (provider: AuthProvider) => () => void;
}

export interface PasswordModalState {
  password: string;
  error: boolean;
}

export class PasswordModal extends React.Component<
  PasswordModalProps,
  PasswordModalState
> {
  state: PasswordModalState = {
    password: '',
    error: false
  };

  onClick = () =>
    CRYPTO.decryptCredentials(this.state.password, this.props.credentials);

  /*//Show copy info text
                    this.setState({
                        ...this.state,
                        showCopyInfo: true
                    });*/

  setPassword = (e: any) => {
    this.setState({ ...this.state, password: e.target.value });
  };

  render() {
    const { onClose, uid } = this.props;
    return (
      <Modal onClose={onClose}>
        <>
          {uid && (
            <div>
              <Input
                id="modal__board-name-input"
                label="Password"
                type="password"
                autoComplete="current-password"
                description="Transfer account credentials"
                invertPlaceholder={false}
                focusTheme="mint"
                showUnderline={true}
                placeholder={`Password`}
                onChange={this.setPassword}
                className="password-modal__input"
                onKeyPress={(event: any) => {
                  if (event.key === 'Enter') {
                    this.onClick();
                    onClose();
                  }
                }}
              />
              <button
                type="button"
                className="copy-button"
                onClick={() => {
                  this.onClick();
                  this.props.onClose();
                }}
                disabled={this.state.password === ''}
              >
                Transfer credentials
              </button>
            </div>
          )}
          <ProviderLogin onProviderLogin={this.props.onProviderLogin} />
        </>
      </Modal>
    );
  }
}

export default PasswordModal;
