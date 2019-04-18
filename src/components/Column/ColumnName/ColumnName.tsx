import * as React from 'react';

import './ColumnName.scss';

export interface ColumnNameProps {
  title: string;
  count: number;
}

const ColumnName: React.FunctionComponent<ColumnNameProps> = ({
  title,
  count
}) => {
  return (
    <h1 className="column-name">
      {title}
      <span className="column-name__count">{count}</span>
    </h1>
  );
};

export default ColumnName;
