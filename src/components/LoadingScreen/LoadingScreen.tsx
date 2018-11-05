import * as React from 'react';
import './LoadingScreen.scss';

export interface LoadingScreenProps {
  status?: string;
}

export const LoadingScreen: React.SFC<LoadingScreenProps> = props => (
  <div className="loading-screen">
    <h1 className="loading-screen__headline">Scrumlr</h1>

    <div className="loading-screen__spinner">
      <div className="bounce1" />
      <div className="bounce2" />
      <div className="bounce3" />
    </div>

    {props.status && (
      <span className="loading-screen__status">{props.status}</span>
    )}
  </div>
);

export default LoadingScreen;
