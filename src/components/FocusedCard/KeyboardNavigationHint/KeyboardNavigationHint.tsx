import * as cx from 'classnames';
import * as React from 'react';

import './KeyboardNavigationHint.css';
import Icon from '../../Icon/Icon';

export interface KeyboardNavigationHintProps {
  className?: string;
}

export class KeyboardNavigationHint extends React.Component<
  KeyboardNavigationHintProps,
  {}
> {
  render() {
    return (
      <div className={cx('keyboard-navigation-hint', this.props.className)}>
        <Icon name="key-up" />
        <span>Previous card</span>

        <Icon name="key-down" />
        <span>Next card</span>

        <Icon name="key-esc" />
        <span>Exit focus</span>
      </div>
    );
  }
}

export default KeyboardNavigationHint;
