import * as React from 'react';
import { Dot } from '../Dot';
import './DownvoteDot.css';
import Icon from '../../../Icon';

export interface DownvoteDotProps {
  onClick: any;
}

export class DownvoteDot extends React.Component<DownvoteDotProps, any> {
  render() {
    const { onClick } = this.props;

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
  }
}
