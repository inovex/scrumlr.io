import * as React from 'react';
import * as classNames from 'classnames';
const withRipple: any = require('@material/react-ripple').default;

import './Button.scss';

export interface ButtonProps {
  primary?: boolean;

  [key: string]: any;
}

export const SimpleButton: React.SFC<ButtonProps> = ({
  children,
  className,
  primary,
  initRipple,
  unbounded,
  ...other
}) => {
  const classes = classNames('button', className, {
    'button--primary': primary,
    'button--secondary': !primary
  });

  return (
    <button {...other} ref={initRipple} className={classes}>
      {children}
    </button>
  );
};

SimpleButton.defaultProps = {
  primary: false
};

export const Button = withRipple(SimpleButton);
export default Button;
