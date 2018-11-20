import * as cx from 'classnames';
import * as React from 'react';

import './Action.scss';

export type ActionTheme = 'light' | 'dark' | 'mint';

export interface ActionProps {
  theme: ActionTheme;
  className?: string;
  children?: React.ReactNode;

  [key: string]: any;
}

const Action: React.SFC<ActionProps> = ({ theme, className, children }) => {
  const componentClassName = cx(
    'action-wrapper',
    `action-wrapper--theme-${theme}`,
    className
  );

  return (
    <div className={componentClassName}>
      <div className="action">{children}</div>
    </div>
  );
};

export default Action;
