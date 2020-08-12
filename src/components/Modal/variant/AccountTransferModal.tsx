import * as React from 'react';

import './AccountTransferModal.scss';
import Modal from '../Modal';

export interface AccountTransferModalProps {
  onClose: () => void;
}

export class AccountTransferModal extends React.Component<
  AccountTransferModalProps,
  {}
> {
  render() {
    const { onClose } = this.props;
    return (
      <Modal onClose={onClose} onSubmit={onClose}>
        <div>hey</div>
      </Modal>
    );
  }
}

export default AccountTransferModal;
