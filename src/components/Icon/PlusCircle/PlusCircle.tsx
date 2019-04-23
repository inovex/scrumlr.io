import * as React from 'react';
import classNames = require('classnames');
import './PlusCircle.scss';
import Circle from '../Circle';

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
  <Circle svgClassName={svgClassName} circleClassName={circleClassName}>
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
  </Circle>
);

export default PlusCircle;
