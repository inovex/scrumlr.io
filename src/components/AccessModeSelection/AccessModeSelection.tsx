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

export const AccessModeSelection: React.SFC<AccessModeSelectionProps> = ({
  mode,
  onChange,
  className,
  ...other
}) => {
  return (
    <div className={classNames('access-mode-selection', className)} {...other}>
      <div className="access-mode-selection__radio">
        <input
          id="access-mode-selection__public"
          type="radio"
          value="public"
          name="access-mode-selection"
          checked={mode === 'public'}
          onChange={(e: any) => {
            onChange(e.target.value);
          }}
        />
        <label
          htmlFor="access-mode-selection__public"
          className="access-mode-selection__label"
        >
          <h3 className="access-mode-selection__title">Public</h3>
          <p className="access-mode-selection__description">
            All users that know the board URL will have access
          </p>
        </label>
      </div>
      <div className="access-mode-selection__radio">
        <input
          id="access-mode-selection__private"
          type="radio"
          value="private"
          name="access-mode-selection"
          checked={mode === 'private'}
          onChange={(e: any) => {
            onChange(e.target.value);
          }}
        />
        <label
          htmlFor="access-mode-selection__private"
          className="access-mode-selection__label"
        >
          <h3 className="access-mode-selection__title">Private</h3>
          <p className="access-mode-selection__description">
            Restricted access to boards, all texts will be encrypted
          </p>
        </label>
      </div>
    </div>
  );
};

export default AccessModeSelection;
