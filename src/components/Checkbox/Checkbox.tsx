import * as React from 'react';

import './Checkbox.css';

export interface CheckboxProps {
  className?: string;
  children?: React.ReactNode;

  [key: string]: any;
}

export const Checkbox: React.SFC<CheckboxProps> = ({
  className,
  children,
  ...other
}) => (
  <label className={className}>
    <input type="checkbox" className="checkbox__input" {...other} />
    <span className="checkbox__label-wrapper">
      <span className="checkbox__control" aria-hidden="true" />
      {children && <span className="checkbox__label">{children}</span>}
    </span>
  </label>
);

export default Checkbox;
