import * as React from 'react';

import './ColumnName.scss';
import Input from '../../Input';

export interface ColumnNameProps {
  title: string;
  count: number;
  isAdmin: boolean;
  onUpdateColumnName: (newName: string) => void;
}

const ColumnName: React.FunctionComponent<ColumnNameProps> = ({
  title,
  count,
  isAdmin,
  onUpdateColumnName
}) => {
  const onBlur = (e: any) => {
    if (e.target.value !== title) {
      onUpdateColumnName(e.target.value);
    }
  };

  return (
    <h1 className="column-name__header">
      {isAdmin && (
        <Input
          type="text"
          className="column-name"
          placeholder="Column name"
          defaultValue={title}
          onClick={(e: any) => e.preventDefault()}
          onKeyDown={(e: any) => {
            if (
              e.keyCode === 13 &&
              document.activeElement instanceof HTMLElement
            ) {
              document.activeElement.blur();
            }
          }}
          onBlur={onBlur}
          showUnderline={true}
          focusTheme="mint"
          invertPlaceholder={true}
        />
      )}
      {!isAdmin && <span className="column-name">{title}</span>}

      <span className="column-name__count">{count}</span>
    </h1>
  );
};

export default ColumnName;
