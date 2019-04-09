import * as cx from 'classnames';
import * as React from 'react';

import './Timer.scss';
import Icon from '../../components/Icon/Icon';

export interface TimerProps {
  timerExpiration?: string;
  onDeleteTimer?: () => void;
  [key: string]: any;
}

export interface TimerState {
  countdownSeconds: number;
  running: boolean;
}

const initialState: TimerState = {
  countdownSeconds: 0,
  running: false
};

export class Timer extends React.Component<TimerProps, TimerState> {
  state: TimerState = initialState;

  componentDidMount() {
    this.tick();
  }

  componentDidUpdate(prevProps: TimerProps) {
    if (this.props.timerExpiration !== prevProps.timerExpiration) {
      this.tick();
    }
  }

  tick() {
    if (!!this.props.timerExpiration) {
      const timeRemaining = this.getTimeRemaining(this.props.timerExpiration);
      const remainingSeconds =
        timeRemaining.minutes * 60 + timeRemaining.seconds;
      if (timeRemaining.minutes >= -1 && timeRemaining.seconds > -10) {
        this.setState(
          {
            countdownSeconds: remainingSeconds,
            running: true
          },
          () => {
            setTimeout(() => {
              this.tick();
            }, 1000);
          }
        );
      } else {
        this.setState({
          running: false
        });
      }
    } else {
      this.setState({
        running: false
      });
    }
  }

  getTimeRemaining(endtime: string) {
    const t = Date.parse(endtime) - Date.parse(new Date() as any);
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    return {
      minutes,
      seconds
    };
  }

  render() {
    const { timerExpiration, onDeleteTimer, className, ...other } = this.props;

    if (this.state.running) {
      const remainingMinutes = Math.floor(this.state.countdownSeconds / 60);
      const remainingSeconds = this.state.countdownSeconds % 60;
      const remainingSecondsString =
        remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

      let text = `${remainingMinutes}:${remainingSecondsString}`;
      if (remainingSeconds < 0) {
        text = `Time's up`;
      }

      return (
        <div className={cx('timer', className)} {...other}>
          <div className="timer__box">
            <Icon className="timer__icon" name="timer" />
            <span className="timer__text">{text}</span>
          </div>
          {!!onDeleteTimer && (
            <button
              className="timer__box timer__close-button"
              onClick={() => onDeleteTimer()}
            >
              <Icon className="timer__icon" name="close20" />
            </button>
          )}
        </div>
      );
    }

    return <></>;
  }
}

export default Timer;
