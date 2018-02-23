import * as cx from 'classnames';
import * as React from 'react';

import './Action.css';

export interface ActionProps {
  theme: string;
  className?: string;
  children?: React.ReactNode;

  [key: string]: any;
}

export class Action extends React.Component<ActionProps, {}> {
  static defaultProps: Partial<ActionProps> = {
    weight: 1
  };

  render() {
    const componentClassName = cx(
      'action-wrapper',
      `action-wrapper--theme-${this.props.theme}`,
      this.props.className
    );

    return (
      <div className={componentClassName}>
        <div className="action">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Action;
