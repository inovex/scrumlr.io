import * as cx from 'classnames';
import * as React from 'react';

import './Timer.scss';
import Icon from '../../components/Icon/Icon';

export interface TimerProps {
  expirationDate?: string;

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
    if (this.props.expirationDate !== prevProps.expirationDate) {
      this.tick();
    }
  }

  tick() {
    if (!!this.props.expirationDate) {
      const timeRemaining = this.getTimeRemaining(this.props.expirationDate);
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
    const { expirationDate, className, ...other } = this.props;

    if (this.state.running) {
      const remainingMinutes = Math.floor(this.state.countdownSeconds / 60);
      const remainingSeconds = this.state.countdownSeconds % 60;
      const remainingSecondsString =
        remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

      if (remainingSeconds < 0) {
        return (
          <div className={cx('timer', className)} {...other}>
            <Icon className="timer__icon" name="timer" />
            <span className="timer__text">Time's up!</span>
          </div>
        );
      } else {
        return (
          <div className={cx('timer', className)} {...other}>
            <Icon className="timer__icon" name="timer" />
            <span className="timer__text">
              {remainingMinutes}:{remainingSecondsString}
            </span>
          </div>
        );
      }
    }

    return <></>;
  }
}

export default Timer;
