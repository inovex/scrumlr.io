import * as React from 'react';
import './LoadingScreen.css';

export const LoadingScreen: React.SFC<{}> = props =>
  <div className="loading-screen">
    <h1 className="loading-screen__headline">Scrumlr</h1>

    <div className="loading-screen__spinner">
      <div className="bounce1" />
      <div className="bounce2" />
      <div className="bounce3" />
    </div>
  </div>;

export default LoadingScreen;
