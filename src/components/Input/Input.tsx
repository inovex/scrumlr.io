import * as cx from 'classnames';
import * as React from 'react';

import './Input.scss';

export interface InputProps {
  invertPlaceholder?: boolean;
  showUnderline?: boolean;
  focusTheme?: string;
  id?: string;
  label?: string;
  description?: string;
  error?: string;

  [key: string]: any;
}

export class Input extends React.Component<InputProps, {}> {
  static defaultProps: Partial<InputProps> = {
    invertPlaceholder: false,
    showUnderline: true
  };

  render() {
    const {
      label,
      description,
      error,
      className,
      showUnderline,
      invertPlaceholder,
      id,
      focusTheme,
      ...other
    } = this.props;

    return (
      <div
        className={cx('input__wrapper', className, {
          'input--underlined': showUnderline,
          'input--error': error,
          [`input__focus-theme-${focusTheme}`]: Boolean(focusTheme)
        })}
      >
        {label && (
          <label htmlFor={id} className="input__label">
            {label}
          </label>
        )}
        <input
          {...other}
          id={id}
          className={cx('input', {
            'input--inverted-placeholder': invertPlaceholder
          })}
        />
        <span className={cx('input__underline')} />

        {description && !error && (
          <span className="input__description">{description}</span>
        )}
        {error && (
          <span className="input__description input__description--error">
            {error}
          </span>
        )}
      </div>
    );
  }
}

export default Input;
