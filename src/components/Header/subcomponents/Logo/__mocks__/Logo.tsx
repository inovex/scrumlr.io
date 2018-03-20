import * as React from 'react';
import { LogoProps } from '../Logo';

export const Logo: React.SFC<LogoProps> = ({ href }) => <a href={href}>Logo</a>;

export default Logo;
