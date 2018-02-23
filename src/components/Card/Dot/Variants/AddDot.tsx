import * as React from 'react';
import './AddDot.css';
import Icon from '../../../Icon';

export interface AddDotProps {
  onClick: () => void;
}

export class AddDot extends React.Component<AddDotProps, any> {
  render() {
    return (
      <Icon
        name="circle-add"
        onClick={this.props.onClick}
        className="dot__add"
      />
    );
  }
}
