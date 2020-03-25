import * as React from 'react';
import * as cx from 'classnames';
import Icon from '../../Icon';
import './ReadyButton.scss';

export interface ReadyButtonProps {
  onToggleReadyState: () => void;
  ready: boolean;
  className?: string;
}

export class ReadyButton extends React.Component<ReadyButtonProps, {}> {
  render() {
    const { ready, onToggleReadyState } = this.props;
    const readyText = ready ? 'Unmark as done' : 'Mark as done';

    return (
      <button
        className={cx('ready-button', {
          'ready-button--ready': ready
        })}
        onClick={() => {
          onToggleReadyState();
          this.setState({ ...this.state, focusedAvatar: true });
        }}
        title={readyText}
      >
        <div className="ready-button__icon-wrapper">
          <Icon
            name="check"
            aria-hidden="true"
            width={16}
            height={16}
            className="ready-button__icon"
          />
        </div>

        <div className="ready-button__text">Mark as done</div>
      </button>
    );
  }
}

export default ReadyButton;
