import * as React from 'react';
import * as cx from 'classnames';
import { default as FocusLock } from 'react-focus-lock';
import Icon from '../Icon';
import * as ReactDOM from 'react-dom';

import './Portal.scss';

export interface PortalProps {
  className?: string;

  /** If set, close button will appear and a click on the backdrop will also trigger the function call. */
  onClose?: () => void;

  /** Vertical alignment of inner elements. */
  verticallyAlignContent?: 'start' | 'center';
  fullWidth?: boolean;

  [key: string]: any;
}

/**
 * Portal for modals adds backdrop and locks focus within portal content.
 */
export class Portal extends React.PureComponent<PortalProps, {}> {
  static defaultProps: Partial<PortalProps> = {
    verticallyAlignContent: 'center',
    fullWidth: false
  };

  handleKeydown = (event: KeyboardEvent) => {
    const closeable = Boolean(this.props.onClose);
    if (closeable && event.key === 'Escape') {
      this.props.onClose!();
      event.preventDefault();
    }
  };

  componentDidMount(): void {
    window.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount(): void {
    window.removeEventListener('keydown', this.handleKeydown);
  }

  render() {
    const {
      className,
      children,
      verticallyAlignContent,
      fullWidth,
      onClose,
      ...other
    } = this.props;
    const closeable = Boolean(onClose);

    // mount backdrop into separate located DOM node 'portal'
    const portal: HTMLElement = document.getElementById('portal')!;
    if (!portal) {
      throw new Error('portal element does not exist');
    }

    return ReactDOM.createPortal(
      <div
        {...other}
        onClick={() => {
          if (closeable) {
            onClose!();
          }
        }}
        className="portal"
      >
        <FocusLock>
          <div className={cx('portal__content', className)}>
            {closeable && (
              <button
                className="portal__close-button"
                onClick={() => {
                  onClose!();
                }}
              >
                <Icon
                  name="key-esc"
                  className="portal__close-button-icon"
                  width={32}
                  height={32}
                />
                <span className="portal__close-button-text">Close</span>
              </button>
            )}
            <div
              onClick={e => e.stopPropagation()}
              style={{
                alignSelf: verticallyAlignContent,
                width: fullWidth ? '100%' : undefined
              }}
            >
              {children}
            </div>
          </div>
        </FocusLock>
      </div>,
      portal
    );
  }
}

export default Portal;
