import * as cx from 'classnames';
import * as React from 'react';

import './Modal.scss';
import Icon from '../Icon';
import { mapDispatchToProps } from './Modal.container';
import { connect } from 'react-redux';
import { default as FocusLock } from 'react-focus-lock';

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
      <div className={cx('modal', 'modal__backdrop')}>
        <FocusLock>
          <div className="modal__content-wrapper">
            <div className="modal__content">
              {this.props.children}

              {(this.props.onClose || this.props.onSubmit) && (
                <div className="modal__action-area">
                  {this.props.onClose && (
                    <button
                      className="modal__close-button"
                      type="button"
                      onClick={this.props.onClose}
                    >
                      <Icon name="close-circle" width={48} height={48} />
                    </button>
                  )}

                  {this.props.onSubmit && (
                    <button
                      type="button"
                      onClick={this.props.onSubmit}
                      className="modal__ack-button"
                    >
                      OK
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </FocusLock>
      </div>
    );
  }
}

export default connect<{}, DispatchModalProps, OwnModalProps>(
  null,
  mapDispatchToProps
)(Modal);
