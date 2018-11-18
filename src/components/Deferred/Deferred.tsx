import * as React from 'react';
import { CRYPTO } from '../../util/global';

export interface DeferredProps {
  value: string;
  iv: string;
}

export interface DeferredState {
  value?: string;
}

export class Deferred extends React.Component<DeferredProps, DeferredState> {
  state = {
    value: undefined
  };

  shouldComponentUpdate(nextProps: DeferredProps, nextState: DeferredState) {
    // FIXME loop here because of state update in componentDidUpdate
    if (
      this.props.value === nextProps.value &&
      this.props.iv === nextProps.iv &&
      this.state.value === nextState.value
    ) {
      return false;
    }
    return true;
  }

  resolveValue = () => {
    CRYPTO.decrypt(this.props.value, this.props.iv).then((value: any) => {
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
