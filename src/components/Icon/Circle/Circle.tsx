import * as React from 'react';
import classNames = require('classnames');
import './Circle.scss';

export interface PlusCircleProps {
  svgClassName?: string;
  circleClassName?: string;
}

export const Circle: React.FunctionComponent<PlusCircleProps> = ({
  svgClassName,
  circleClassName,
  children
}) => (
  <svg viewBox="0 0 32 32" className={classNames('circle', svgClassName)}>
    <circle
      className={classNames('circle__circle', circleClassName)}
      cx="16"
      cy="16"
      r="15"
    />
    {children}
  </svg>
);

export default Circle;
