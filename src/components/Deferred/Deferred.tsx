import * as React from 'react';
import { CRYPTO } from '../../util/global';

export interface DeferredProps {
  value: string;
}

export interface DeferredState {
  value?: string;
}

export class Deferred extends React.Component<DeferredProps, DeferredState> {
  state = {
    value: undefined
  };

  resolveValue = () => {
    CRYPTO.decrypt(this.props.value).then((value: any) => {
      this.setState({ value });
    });
  };

  componentDidMount() {
    this.resolveValue();
  }

  componentDidUpdate() {
    this.resolveValue();
  }

  render() {
    return <>{this.state.value ? this.state.value : 'Loading'}</>;
  }
}

export default Deferred;
