import * as React from 'react';

import './Avatar.scss';
import * as cx from 'classnames';

const BACKGROUND_COLORS = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey'
];

export interface AvatarProps {
  user: { name: string; image?: string };
  className?: string;
  faded?: boolean;
}

export const Avatar: React.FunctionComponent<AvatarProps> = ({
  user,
  faded = false,
  className
}) => {
  const altText = user.name;

  if (!user.image) {
    const color =
      user.name
        .split('')
        .map(char => char.charCodeAt(0))
        .reduce((a, b) => a + b, 0) % BACKGROUND_COLORS.length;
    return (
      <div
        className={cx(
          'avatar',
          `avatar--${BACKGROUND_COLORS[color]}`,
          className,
          { 'avatar--faded': faded }
        )}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      className={cx('avatar', className, {
        'avatar--faded': faded
      })}
      src={user.image}
      alt={altText}
      title={altText}
    />
  );
};

export default Avatar;
