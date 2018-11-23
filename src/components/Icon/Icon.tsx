import * as cx from 'classnames';
import * as React from 'react';

import { IconNames } from './types';
import { iconMap } from './definitions';
import './Icon.scss';

export interface IconProps {
  name: IconNames;
  height?: number | null;
  width?: number | null;

  [key: string]: any;
}

const defaultProps: Partial<IconProps> = {
  width: 32,
  height: 32
};

export class Icon extends React.Component<IconProps, {}> {
  static defaultProps: Partial<IconProps> = defaultProps;

  render() {
    const { name, className, width, height, style, ...other } = this.props;
    const icon = iconMap[name];
    if (!icon) {
      return null;
    }

    let content = require(`!svg-inline-loader!../../assets/${icon}.svg`);

    const componentClassName = cx('icon', className);
    return (
      <span
        className={componentClassName}
        {...other}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ ...style, width, height }}
      />
    );
  }
}

export default Icon;
