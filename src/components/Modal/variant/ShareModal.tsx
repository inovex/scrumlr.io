import * as cx from 'classnames';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';

import './ShareModal.css';
import Modal from '../Modal';

export interface ShareModalProps {
  onClose: () => void;
}

export interface ShareModalState {
  showCopyInfo: boolean;
}

export class ShareModal extends React.Component<
  ShareModalProps,
  ShareModalState
> {
  constructor(props: ShareModalProps) {
    super(props);
    this.state = { showCopyInfo: false };
  }

  displayCopyMessage = () => {
    this.setState({ ...this.state, showCopyInfo: true });
  };

  render() {
    const { onClose } = this.props;

    const link = window.location.href.replace('board', 'join');
    const encoded = encodeURI(link).replace('#', '%23');

    return (
      <Modal onClose={onClose} onSubmit={onClose}>
        <div className="share-modal">
          <h2 className="share-modal__headline">Invite</h2>

          <a href={link} className="share-modal__qr">
            <img
              src={`https://chart.googleapis.com/chart?cht=qr&chs=400x400&chld=L|0&chl=${encoded}`}
              className="share-modal__qr-image"
            />
          </a>
          <CopyToClipboard text={link} onCopy={this.displayCopyMessage}>
            <button type="button" className="share-modal__invite-button">
              Copy invite URL
            </button>
          </CopyToClipboard>
          <span
            className={cx('share-modal__copy-text', {
              'share-modal__copy-text--hidden': !this.state.showCopyInfo
            })}
          >
            URL copied to clipboard
          </span>
        </div>
      </Modal>
    );
  }
}

export default ShareModal;
