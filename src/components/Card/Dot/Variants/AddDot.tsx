import * as React from 'react';
import './AddDot.scss';
import PlusCircle from '../../../Icon/PlusCircle';

export interface AddDotProps {
  onClick: () => void;
}

export class AddDot extends React.Component<AddDotProps, any> {
  render() {
    return (
      <button onClick={this.props.onClick} className="add-dot">
        <PlusCircle
          svgClassName="add-dot__plus-circle"
          circleClassName="add-dot__plus-circle-icon-circle"
          plusLineClassName="add-dot__plus-circle-icon-plus-line"
        />
      </button>
    );
  }
}
