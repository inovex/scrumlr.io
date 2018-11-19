import * as React from 'react';
import * as classNames from 'classnames';
import './LoadingIndicator.scss';

export interface LoadingIndicatorProps {
  className?: string;
  [key: string]: any;
}

export const LoadingIndicator: React.SFC<LoadingIndicatorProps> = ({
  className,
  ...other
}) => (
  <div className={classNames('loading-indicator', className)} {...other}>
    <div className="bounce1" />
    <div className="bounce2" />
    <div className="bounce3" />
  </div>
);

export default LoadingIndicator;
