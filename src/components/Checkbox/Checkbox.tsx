import * as React from 'react';

import './Checkbox.css';

export interface CheckboxProps {
  label: string;
  className?: string;

  [key: string]: any;
}

export const Checkbox: React.SFC<CheckboxProps> = ({
  className,
  label,
  ...other
}) => (
  <label className={className}>
    <input type="checkbox" className="checkbox__input" {...other} />
    <span className="checkbox__label-wrapper">
      <span className="checkbox__control" aria-hidden="true" />
      <span className="checkbox__label">{label}</span>
    </span>
  </label>
);

export default Checkbox;
