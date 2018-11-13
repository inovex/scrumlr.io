import * as React from 'react';
import * as classNames from 'classnames';
const withRipple: any = require('@material/react-ripple').default;

import './Button.scss';

export interface ButtonProps {
  [key: string]: any;
}

export const SimpleButton: React.SFC<ButtonProps> = ({
  children,
  className,
  initRipple,
  unbounded,
  ...other
}) => {
  return (
    <button
      {...other}
      ref={initRipple}
      className={classNames('button', className)}
    >
      {children}
    </button>
  );
};

export const Button = withRipple(SimpleButton);
export default Button;
