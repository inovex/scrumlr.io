import * as cx from 'classnames';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import './SettingsModal.css';
import Input from '../../Input';
import Modal from '../Modal';
import getRandomName from '../../../constants/Name';

export interface SettingsModalProps {
  isAdmin: boolean;
  boardName?: string;
  username?: string;
  email?: string;
  isAnonymous: boolean;
  onClose: () => void;
  onChangeBoardName: (name: string) => void;
  onChangeUsername: (name: string) => void;
  onChangeEmail: (name: string) => void;
}

export interface SettingsModalState {
  showCopyInfo: boolean;
}

export class SettingsModal extends React.Component<
  SettingsModalProps,
  SettingsModalState
> {
  constructor(props: SettingsModalProps) {
    super(props);
    this.state = { showCopyInfo: false };
  }

  displayCopyMessage = () => {
    this.setState({ ...this.state, showCopyInfo: true });
  };

  render() {
    const link = window.location.href.replace('board', 'join');
    const encoded = encodeURI(link).replace('#', '%23');

    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${now.getMonth() +
      1}/${now.getDate()}`;

    return (
      <Modal onClose={this.props.onClose} onSubmit={this.props.onClose}>
        <div className="settings-modal__content">
          <div className="modal__settings-panel">
            <h2 className="modal__headline">Settings</h2>

            {this.props.isAdmin &&
              <Input
                id="modal__board-name-input"
                label="Name"
                description="The name of this session"
                invertPlaceholder={false}
                focusTheme="mint"
                showUnderline={true}
                placeholder={`Retrospective ${formattedDate}`}
                onChange={(e: any) =>
                  this.props.onChangeBoardName(e.target.value)}
                defaultValue={this.props.boardName}
                className="settings-modal__input"
              />}

            <Input
              id="modal__username-input"
              label="Username"
              description="Your username will be displayed to the other session members."
              invertPlaceholder={false}
              focusTheme="mint"
              showUnderline={true}
              placeholder={getRandomName()}
              onChange={(e: any) => this.props.onChangeUsername(e.target.value)}
              defaultValue={this.props.username}
              className="settings-modal__input"
            />

            {this.props.isAnonymous &&
              <Input
                id="modal__email-input"
                label="E-Mail"
                description="(optional) The e-mail will be used to grab your Gravatar profile. It will be kept secret and will not be shown to any other users."
                invertPlaceholder={false}
                focusTheme="mint"
                showUnderline={true}
                placeholder="yourmail@scrumlr.io"
                onChange={(e: any) => this.props.onChangeEmail(e.target.value)}
                defaultValue={this.props.email}
                className="settings-modal__input"
              />}
          </div>

          <div className="modal__invite-panel">
            <h2 className="modal__headline">Invite</h2>

            <a href={link} className="modal__qr">
              <img
                src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chld=L|0&chl=${encoded}`}
              />
            </a>
            <CopyToClipboard text={link} onCopy={this.displayCopyMessage}>
              <button type="button" className="modal__invite-button">
                Copy invite URL
              </button>
            </CopyToClipboard>
            <span
              className={cx('modal__copy-text', {
                'modal__copy-text--hidden': !this.state.showCopyInfo
              })}
            >
              URL copied to clipboard
            </span>
          </div>
        </div>
      </Modal>
    );
  }
}

export default SettingsModal;
