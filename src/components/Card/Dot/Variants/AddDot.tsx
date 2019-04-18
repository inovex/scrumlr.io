import * as React from 'react';
import './AddDot.scss';
import Icon from '../../../Icon';

export interface AddDotProps {
  onClick: () => void;
}

export class AddDot extends React.Component<AddDotProps, any> {
  render() {
    return (
      <button onClick={this.props.onClick} className="dot__add">
        <Icon name="circle-add" />
      </button>
    );
  }
}
