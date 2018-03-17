import * as React from 'react';
import { IndexedPhaseConfiguration } from '../../constants/Retrospective';
import Icon from '../Icon/Icon';
import './PhaseSplash.css';
import ReactSwipe = require('react-swipe');

export interface PhaseSplashProps {
  phase: IndexedPhaseConfiguration;
  onClose?: () => void;
}

export interface PhaseSplashState {
  showCarousel: boolean;
}

export class PhaseSplash extends React.Component<
  PhaseSplashProps,
  PhaseSplashState
> {
  constructor(props: PhaseSplashProps) {
    super(props);

    this.state = {
      showCarousel: false
    };
  }

  updateSize = () => {
    if (window.innerWidth >= 768 && this.state.showCarousel) {
      this.setState({ ...this.state, showCarousel: false });
    }

    if (window.innerWidth < 768 && !this.state.showCarousel) {
      this.setState({ ...this.state, showCarousel: true });
    }
  };

  componentDidMount() {
    this.updateSize();
    window.addEventListener('resize', this.updateSize, true);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  render() {
    const { phase, onClose } = this.props;

    const activities = phase.activities.map(activity => (
      <span className="phase-splash__activity" key={activity.icon}>
        <Icon name={activity.icon} width={172} height={172} />
        <p className="phase-splash__activity-description">
          {activity.description}
        </p>
      </span>
    ));

    return (
      <div className="phase-splash">
        <button
          className="phase-splash__close-button"
          type="button"
          onClick={onClose}
        >
          <Icon name="close-circle" width={48} height={48} />
        </button>

        <h2 className="phase-splash__index">Phase {phase.index + 1}</h2>
        <h1 className="phase-splash__name">{phase.name}</h1>

        {!this.state.showCarousel && (
          <div className="phase-splash__activities">{activities}</div>
        )}

        {this.state.showCarousel && (
          <div className="phase-splash__carousel-wrapper">
            <Icon
              name="chevron-left"
              className="phase-splash__carousel-navigation"
              width={48}
              height={48}
            />
            <ReactSwipe
              className="phase-splash__carousel"
              key={activities.length}
              swipeOptions={{
                startSlide: 0,
                auto: 5000,
                speed: 500
              }}
            >
              {activities}
            </ReactSwipe>
            <Icon
              name="chevron-right"
              className="phase-splash__carousel-navigation"
              width={48}
              height={48}
            />
          </div>
        )}

        <button
          className="phase-splash__button"
          type="button"
          onClick={onClose}
          autoFocus
        >
          Got it!
        </button>
      </div>
    );
  }
}

export default PhaseSplash;
