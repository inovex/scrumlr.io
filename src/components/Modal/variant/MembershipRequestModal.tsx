import * as React from 'react';
import Modal from '../Modal';
import Button from '../../Button';

import './MembershipRequestModal.scss';

export interface MembershipRequestModalProps {
  onDeny?: () => void;
  onAccept?: () => void;
  member: {
    photo?: string;
    name: string;
  };
}

const MembershipRequestModal: React.SFC<MembershipRequestModalProps> = ({
  onDeny,
  onAccept,
  member,
  ...other
}) => (
  <Modal {...other}>
    <div className="membership-request-modal__container">
      <h1 className="membership-request-modal__h1">Grant access</h1>
      <div className="membership-request-modal__request-message">
        <img
          src={member.photo}
          className="membership-request-modal__member-photo"
        />
        <p className="membership-request-modal__prompt">
          <strong>{member.name}</strong> requests access to this session. Do you
          want to grant him access to this board?
        </p>
      </div>

      <div className="membership-request-modal__action-area">
        <Button onClick={onDeny}>Deny</Button>
        <Button onClick={onAccept} primary>
          Accept
        </Button>
      </div>
    </div>
  </Modal>
);

export default MembershipRequestModal;
