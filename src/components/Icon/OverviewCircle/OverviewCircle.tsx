import * as React from 'react';
import classNames = require('classnames');
import './OverviewCircle.scss';
import Circle from '../Circle';

export interface OverviewCircleProps {
  svgClassName?: string;
  circleClassName?: string;
  squareClassName?: string;
}

export const OverviewCircle: React.FunctionComponent<OverviewCircleProps> = ({
  svgClassName,
  circleClassName,
  squareClassName
}) => (
  <Circle svgClassName={svgClassName} circleClassName={circleClassName}>
    <rect
      x="10"
      y="10"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
    <rect
      x="14.5"
      y="10"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
    <rect
      x="19"
      y="10"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />

    <rect
      x="10"
      y="14.5"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
    <rect
      x="14.5"
      y="14.5"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
    <rect
      x="19"
      y="14.5"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />

    <rect
      x="10"
      y="19"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
    <rect
      x="14.5"
      y="19"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
    <rect
      x="19"
      y="19"
      width="3"
      height="3"
      className={classNames('overview-circle__square', squareClassName)}
    />
  </Circle>
);

export default OverviewCircle;
