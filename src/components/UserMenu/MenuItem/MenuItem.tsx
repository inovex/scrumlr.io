import * as React from 'react';
import * as cx from 'classnames';
import { Icon, IconNames } from '../../Icon';

import './MenuItem.css';

export interface MenuItemProps {
  onClick: (e: any) => void;
  name: string;
  icon: IconNames;
  className?: string;
}

export const MenuItem: React.SFC<MenuItemProps> = ({
  onClick,
  name,
  icon,
  className
}) => {
  return (
    <button className={cx('menu-item__button', className)} onClick={onClick}>
      <Icon className="menu-item__button-icon" name={icon} />
      <span className="menu-item__button-text">
        {name}
      </span>
    </button>
  );
};

export default MenuItem;
