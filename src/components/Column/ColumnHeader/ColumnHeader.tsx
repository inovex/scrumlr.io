import * as cx from 'classnames';
import * as React from 'react';

import './ColumnHeader.scss';
import ColumnName from '../ColumnName';
import OverviewCircle from '../../Icon/OverviewCircle';

export interface ColumnHeaderProps {
  title: string;
  count: number;

  onToggleOverview?: () => void;

  className?: string;
}

const ColumnHeader: React.FunctionComponent<ColumnHeaderProps> = ({
  title,
  onToggleOverview,
  count,
  className
}) => {
  return (
    <header className={cx('column-header', className)}>
      <hr className="column-header__hr" />
      <div className="column-header__title-wrapper">
        <ColumnName title={title} count={count} />
        {onToggleOverview && (
          <button
            aria-label="Open overview"
            className="column-header__overview-button"
            onClick={() => onToggleOverview()}
          >
            <OverviewCircle
              svgClassName="column-header__overview-icon"
              circleClassName="column-header__overview-icon-circle"
              squareClassName="column-header__overview-icon-square"
            />
          </button>
        )}
      </div>
    </header>
  );
};

export default ColumnHeader;
