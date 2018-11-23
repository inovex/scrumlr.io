import * as React from 'react';
import { CRYPTO } from '../../util/global';
import LoadingIndicator from '../LoadingIndicator';
import './Deferred.scss';

export interface DeferredProps {
  value: string;
  iv: string;
}

export interface DeferredState {
  value?: string;
}

export class Deferred extends React.PureComponent<
  DeferredProps,
  DeferredState
> {
  state = {
    value: undefined
  };

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
    return (
      <>
        {this.state.value ? (
          this.state.value
        ) : (
          <LoadingIndicator className="deferred__loading-indicator" />
        )}
      </>
    );
  }
}

export default Deferred;
