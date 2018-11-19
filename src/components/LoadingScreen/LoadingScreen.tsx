import * as React from 'react';
import './LoadingScreen.scss';
import LoadingIndicator from '../LoadingIndicator';

export interface LoadingScreenProps {
  status?: string;
}

export const LoadingScreen: React.SFC<LoadingScreenProps> = props => (
  <div className="loading-screen">
    <h1 className="loading-screen__headline">Scrumlr</h1>

    <LoadingIndicator />

    {props.status && (
      <span className="loading-screen__status">{props.status}</span>
    )}
  </div>
);

export default LoadingScreen;
