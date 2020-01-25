import React from 'react';
import MaterialButton, { ButtonProps as MaterialButtonProps } from '@material-ui/core/Button';

//export interface ButtonProps extends Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'ref' | 'color'> {}
export interface ButtonProps extends MaterialButtonProps {}

export const Button: React.FC<ButtonProps> = ({ children, ...other }) => {
    return <MaterialButton {...other}>{children}</MaterialButton>;
};

export default Button;
