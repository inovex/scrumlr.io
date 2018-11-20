import * as cx from 'classnames';
import * as React from 'react';

import './Component.scss';

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

class Component extends React.Component<ComponentProps, {}> {
  render() {
    const { className, children } = this.props;
    const childrenCount = React.Children.count(children);

    return (
      <div className={cx(className, 'component')}>
        <div className="component__content">
          {React.Children.map(
            children,
            (child: React.ReactChild, index: number) => {
              return index < childrenCount - 1 ? child : null;
            }
          )}
        </div>
        <div className="component__footer">
          {React.Children.map(
            children,
            (child: React.ReactChild, index: number) => {
              return index === childrenCount - 1 ? child : null;
            }
          )}
        </div>
      </div>
    );
  }
}

export default Component;
