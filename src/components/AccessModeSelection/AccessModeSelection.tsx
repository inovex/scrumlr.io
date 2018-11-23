import * as React from 'react';
import * as classNames from 'classnames';
import './AccessModeSelection.scss';

export type AccessMode = 'private' | 'public';

export interface AccessModeSelectionProps {
  mode: AccessMode;
  onChange: (mode: AccessMode) => void;
  className?: string;

  [key: string]: any;
}

const AccessModeSelectRadio: React.SFC<any> = ({
  id,
  value,
  mode,
  onChange,
  name,
  description
}) => (
  <div className="access-mode-selection__radio">
    <input
      id={id}
      type="radio"
      value={value}
      name="access-mode-selection"
      checked={mode === value}
      onChange={(e: any) => {
        onChange(e.target.value);
      }}
    />
    <label htmlFor={id} className="access-mode-selection__label">
      <h3 className="access-mode-selection__title">{name}</h3>
      <p className="access-mode-selection__description">{description}</p>
    </label>
  </div>
);

export const AccessModeSelection: React.SFC<AccessModeSelectionProps> = ({
  mode,
  onChange,
  className,
  ...other
}) => {
  return (
    <div className={classNames('access-mode-selection', className)} {...other}>
      <AccessModeSelectRadio
        id="access-mode-selection__public"
        value="public"
        mode={mode}
        onChange={onChange}
        name="Public"
        description="All users who know the board URL have access"
      />
      <AccessModeSelectRadio
        id="access-mode-selection__private"
        value="private"
        mode={mode}
        onChange={onChange}
        name="Private"
        description="Restricted access to boards, all texts will be encrypted"
      />
    </div>
  );
};

export default AccessModeSelection;
