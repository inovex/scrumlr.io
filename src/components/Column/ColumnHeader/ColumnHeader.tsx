import * as cx from 'classnames';
import * as React from 'react';

import './ColumnHeader.scss';
import ColumnName from '../ColumnName';
import OverviewCircle from '../../Icon/OverviewCircle';

export interface ColumnHeaderProps {
  title: string;
  count: number;
  isAdmin: boolean;

  onToggleOverview?: () => void;
  onUpdateColumnName: (newName: string) => void;

  className?: string;
}

const ColumnHeader: React.FunctionComponent<ColumnHeaderProps> = ({
  title,
  onToggleOverview,
  onUpdateColumnName,
  count,
  className,
  isAdmin
}) => {
  return (
    <header className={cx('column-header', className)}>
      <hr className="column-header__hr" />
      <div className="column-header__title-wrapper">
        <ColumnName
          title={title}
          count={count}
          isAdmin={isAdmin}
          onUpdateColumnName={onUpdateColumnName}
        />
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
