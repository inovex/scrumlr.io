import * as React from 'react';

export class Modal extends React.Component<any, {}> {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export default Modal;
