import * as React from 'react';

import './Avatar.scss';
import * as cx from 'classnames';
import { getCapitalLetter } from '../../util/emojis';

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

  if (!user.image || user.image.includes('www.gravatar.com')) {
    const color =
      user.name
        .split('')
        .map(char => char.charCodeAt(0))
        .reduce((a, b) => a + b, 0) % BACKGROUND_COLORS.length;
    // string iterator correctly handles emojis but will break with grapheme clusters but still look ok-ish
    // see https://stackoverflow.com/questions/46157867/how-to-get-the-nth-unicode-character-from-a-string-in-javascript
    const capitalLetter = getCapitalLetter(user.name);
    return (
      <div
        className={cx(
          'avatar',
          `avatar--${BACKGROUND_COLORS[color]}`,
          className,
          { 'avatar--faded': faded }
        )}
      >
        {capitalLetter}
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
