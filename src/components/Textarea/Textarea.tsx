import * as cx from 'classnames';
import * as React from 'react';

import './Textarea.scss';

export interface TextareaProps {
  invertPlaceholder?: boolean;
  showUnderline?: boolean;
  focusTheme?: string;
  id?: string;
  label?: string;
  description?: string;

  [key: string]: any;
}

export class Textarea extends React.Component<TextareaProps, {}> {
  static defaultProps: Partial<TextareaProps> = {
    invertPlaceholder: false,
    showUnderline: true
  };

  render() {
    const {
      label,
      description,
      className,
      showUnderline,
      invertPlaceholder,
      id,
      focusTheme,
      ...other
    } = this.props;

    return (
      <div
        className={cx('textarea__wrapper', className, {
          'textarea--underlined': showUnderline,
          [`textarea__focus-theme-${focusTheme}`]: Boolean(focusTheme)
        })}
      >
        {label && (
          <label htmlFor={id} className="textarea__label">
            {label}
          </label>
        )}
        <textarea
          {...other}
          id={id}
          className={cx('textarea', {
            'textarea--inverted-placeholder': invertPlaceholder
          })}
        />
        <span className={cx('textarea__underline')} />
        {description && (
          <span className="textarea__description">{description}</span>
        )}
      </div>
    );
  }
}

export default Textarea;
