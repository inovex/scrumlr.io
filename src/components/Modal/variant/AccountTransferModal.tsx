import * as React from 'react';

import './AccountTransferModal.scss';
import Modal from '../Modal';
import Input from '../../Input';
import { CRYPTO } from '../../../util/global';
import * as cx from 'classnames';

export interface AccountTransferModalProps {
  onClose: () => void;
  uid: string;
}

export interface AccountTransferModalState {
  password: string;
  showCopyInfo: boolean;
}

export class AccountTransferModal extends React.Component<
  AccountTransferModalProps,
  AccountTransferModalState
> {
  state: AccountTransferModalState = {
    password: '',
    showCopyInfo: false
  };

  onClick = () => {
    CRYPTO.generateInitializationVector()
      // Encrypt credentials with user input and provider login id
      .then(iv =>
        CRYPTO.encryptCredentials(this.state.password + this.props.uid, iv)
      )
      .then(encryptedCredentials => {
        {
          // Add a md5 checksum at the end of the link to ensure integrity
          const link =
            window.location.href.replace('new', 'transfer/:') +
            encryptedCredentials +
            '_' +
            CRYPTO.md5hash(encryptedCredentials);

          copyToClipboard(link);

          //Show copy info text
          this.setState({
            ...this.state,
            showCopyInfo: true
          });
        }
      });
  };

  setPassword = (e: any) => {
    this.setState({ ...this.state, password: e.target.value });
  };

  render() {
    const { onClose } = this.props;
    return (
      <Modal onClose={onClose} onSubmit={onClose}>
        <h2 className="modal__headline">Transfer access to another device</h2>
        <p className={'account-transfer-modal_info'}>
          Don't share this link with anyone - it will only work with your
          Scrumlr account. Just open it in a new browser and follow the
          instructions!
        </p>
        <>
          <Input
            id="modal__board-name-input"
            label="Password"
            type="password"
            autoComplete="new-password"
            description="Create a password to protect your transfer link"
            invertPlaceholder={false}
            focusTheme="mint"
            showUnderline={true}
            placeholder={`Password`}
            onChange={this.setPassword}
            className="account-transfer-modal__input"
            onKeyPress={(event: any) => {
              if (event.key === 'Enter') {
                this.onClick();
              }
            }}
          />
          <button
            type="button"
            className="copy-button"
            onClick={this.onClick}
            disabled={this.state.password === ''}
          >
            Generate link!
          </button>
          <span
            className={cx('copy-text', {
              'copy-text--hidden': !this.state.showCopyInfo
            })}
          >
            URL copied to clipboard!
          </span>
        </>
      </Modal>
    );
  }
}

// Workaround for copying to clipboard asynchronously
function copyToClipboard(item: string) {
  const create_copy = (e: ClipboardEvent) => {
    e.clipboardData.setData('text/plain', item);
    e.preventDefault();
  };
  document.addEventListener('copy', create_copy);
  document.execCommand('copy');
  document.removeEventListener('copy', create_copy);
}

export default AccountTransferModal;
