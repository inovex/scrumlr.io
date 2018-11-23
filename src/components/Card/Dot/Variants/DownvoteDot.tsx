import * as React from 'react';
import { Dot } from '../Dot';
import './DownvoteDot.scss';
import Icon from '../../../Icon';

export interface DownvoteDotProps {
  onClick: () => void;
}

export const DownvoteDot: React.SFC<DownvoteDotProps> = ({
  onClick,
  children
}) => {
  if (children) {
    return (
      <Dot animate size="small" onClick={onClick} className="dot__downvote">
        {children}
      </Dot>
    );
  }

  return (
    <Dot animate size="small" onClick={onClick} className="dot__downvote">
      <Icon
        name="minus"
        aria-hidden="true"
        className="dot_downvote-icon"
        width={28}
        height={28}
      />
    </Dot>
  );
};
