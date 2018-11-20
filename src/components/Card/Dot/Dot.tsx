import * as classNames from 'classnames';
import * as React from 'react';

import './Dot.scss';

export type DotSize = 'small' | 'large';

export interface DotProps {
  size: DotSize;
  animate?: boolean;
  onClick?: (() => void) | undefined;

  [key: string]: any;
}

export class Dot extends React.Component<DotProps, {}> {
  static defaultProps: Partial<DotProps> = {
    animate: false,
    onClick: undefined
  };

  renderContent = () => {
    const { children, animate, onClick, size } = this.props;

    if (onClick) {
      return (
        <button
          type="button"
          className={classNames('dot', 'dot__interactive', `dot__${size}`)}
          onClick={onClick}
        >
          {animate && <span className="dot__folded-corner" />}

          {children}
        </button>
      );
    }

    return <div className={classNames('dot', `dot__${size}`)}>{children}</div>;
  };

  render() {
    const { className, size } = this.props;

    return (
      <span className={classNames(`dot__${size}`, className)}>
        {this.renderContent()}
      </span>
    );
  }
}

export default Dot;
