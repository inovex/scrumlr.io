import * as cx from 'classnames';
import * as React from 'react';

import './Modal.css';
import Icon from '../Icon/Icon';

export interface ModalProps {
  onClose: () => void;
  onSubmit?: () => void;
  children: any;
}

export class Modal extends React.Component<ModalProps, {}> {
  render() {
    return (
      <div className={cx('modal', 'modal__backdrop')}>
        <div className="modal__content-wrapper">
          <div className="modal__content">
            {this.props.children}

            <div className="modal__action-area">
              <button
                className="modal__close-button"
                type="button"
                onClick={this.props.onClose}
              >
                <Icon name="close-circle" width={48} height={48} />
              </button>

              {this.props.onSubmit &&
                <button
                  type="button"
                  onClick={this.props.onSubmit}
                  className="modal__ack-button"
                >
                  OK
                </button>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
