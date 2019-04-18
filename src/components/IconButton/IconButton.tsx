import * as React from 'react';
import * as classNames from 'classnames';
import Icon from '../Icon';

import './IconButton.scss';

export interface IconButtonProps {
  icon: React.ReactElement<Icon>;
  [key: string]: any;
}

export const IconButton: React.FunctionComponent<IconButtonProps> = ({
  icon,
  className,
  children,
  ...other
}) => {
  return (
    <button {...other} className={classNames('icon-button', className)}>
      <span className="icon-button__text">{children}</span>
      <span className="icon-button__icon-wrapper">
        {React.cloneElement(icon, {
          width: 20,
          height: 20,
          className: 'icon-button__icon'
        } as any)}
      </span>
    </button>
  );
};

export default IconButton;
