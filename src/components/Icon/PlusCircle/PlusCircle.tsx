import * as React from 'react';
import classNames = require('classnames');
import './PlusCircle.scss';

export interface PlusCircleProps {
  svgClassName?: string;
  circleClassName?: string;
  plusLineClassName?: string;
}

export const PlusCircle: React.FunctionComponent<PlusCircleProps> = ({
  svgClassName,
  circleClassName,
  plusLineClassName
}) => (
  <svg viewBox="0 0 32 32" className={classNames('plus-circle', svgClassName)}>
    <circle
      className={classNames('plus-circle__circle', circleClassName)}
      cx="16"
      cy="16"
      r="15"
    />
    <line
      className={classNames('plus-circle__plus-line', plusLineClassName)}
      x1="9"
      x2="23"
      y1="16"
      y2="16"
    />
    <line
      className={classNames('plus-circle__plus-line', plusLineClassName)}
      x1="16"
      x2="16"
      y1="9"
      y2="23"
    />
  </svg>
);

export default PlusCircle;
