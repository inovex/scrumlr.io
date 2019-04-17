import * as React from 'react';

import './Modal.scss';
import { mapDispatchToProps } from './Modal.container';
import { connect } from 'react-redux';
import Portal from '../Portal';

export interface OwnModalProps {
  onClose?: () => void;
  onSubmit?: () => void;
  children: any;
}

export interface DispatchModalProps {
  onStatus: (open: boolean) => void;
}

export type ModalProps = OwnModalProps & DispatchModalProps;

export class Modal extends React.Component<ModalProps, {}> {
  componentWillMount() {
    this.props.onStatus(true);
  }

  componentWillUnmount() {
    this.props.onStatus(false);
  }

  render() {
    return (
      <Portal onClose={this.props.onClose}>
        <div className="modal__content-wrapper">
          <div className="modal__content">
            {this.props.children}
            {this.props.onSubmit && (
              <div className="modal__action-area">
                <button
                  type="button"
                  onClick={this.props.onSubmit}
                  className="modal__ack-button"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      </Portal>
    );
  }
}

export default connect<{}, DispatchModalProps, OwnModalProps>(
  null,
  mapDispatchToProps
)(Modal);
