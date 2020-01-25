import React from 'react';
import MaterialCheckbox, { CheckboxProps as MaterialCheckboxProps } from '@material-ui/core/Checkbox';

//export interface ButtonProps extends Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'ref' | 'color'> {}
export interface CheckboxProps extends MaterialCheckboxProps {}

export const Checkbox: React.FC<CheckboxProps> = ({ children, ...other }) => {
    return <MaterialCheckbox {...other}>{children}</MaterialCheckbox>;
};

export default Checkbox;
