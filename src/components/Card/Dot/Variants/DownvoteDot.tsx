import * as React from 'react';
import { Dot } from '../Dot';
import './DownvoteDot.css';

export interface DownvoteDotProps {
  onClick: any;
}

export class DownvoteDot extends React.Component<DownvoteDotProps, any> {
  renderBody = () => {
    const { children } = this.props;
    if (children) {
      return (
        <span className="dot__downvote-custom-content">
          {children}
        </span>
      );
    }
    return (
      <i className="fa fa-minus dot__downvote-content" aria-hidden="true" />
    );
  };

  render() {
    const { onClick } = this.props;

    return (
      <Dot animate size="small" onClick={onClick} className="dot__downvote">
        {this.renderBody()}
      </Dot>
    );
  }
}
