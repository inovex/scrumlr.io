import * as cx from 'classnames';
import * as React from 'react';

import './Title.css';

export interface TitleProps {
  children?: React.ReactNode;
  className?: string;

  count: number;
}

class Title extends React.Component<TitleProps, {}> {
  render() {
    const { children, count } = this.props;

    return (
      <header className={cx('title', this.props.className)}>
        <hr className="title__hr" />
        <div className="title__title-wrapper">
          <h1 className="title__title">
            {children}
            <span className="title__count">
              {count}
            </span>
          </h1>
        </div>
      </header>
    );
  }
}

export default Title;
