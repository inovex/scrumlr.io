import * as React from 'react';
import * as cx from 'classnames';
import { default as FocusLock } from 'react-focus-lock';
import Icon from '../Icon';
import { Key } from 'ts-keycode-enum';
import * as ReactDOM from 'react-dom';

import './Portal.scss';

export interface PortalProps {
  className?: string;

  /** If set, close button will appear and a click on the backdrop will also trigger the function call. */
  onClose?: () => void;

  /** Vertical alignment of inner elements. */
  verticallyAlignContent?: 'start' | 'center';

  [key: string]: any;
}

export const Portal: React.FunctionComponent<PortalProps> = ({
  className,
  children,
  verticallyAlignContent,
  onClose,
  ...other
}) => {
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
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (closeable && event.keyCode == Key.Escape) {
          onClose!();
        }
      }}
    >
      <FocusLock>
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
        <div className={cx('portal__content', className)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ alignSelf: verticallyAlignContent }}
          >
            {children}
          </div>
        </div>
      </FocusLock>
    </div>,
    portal
  );
};
Portal.defaultProps = {
  verticallyAlignContent: 'center'
};

export default Portal;
