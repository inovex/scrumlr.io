import { connect, MapStateToPropsParam } from 'react-redux';
import { ComponentClass } from 'react';

export function connectWithProps<OwnProps, MergedProps>(
  mapStateToProps: MapStateToPropsParam<MergedProps, OwnProps>
) {
  return (componentClass: ComponentClass<MergedProps>) =>
    connect<
      MergedProps,
      {},
      OwnProps,
      MergedProps
    >(mapStateToProps, {}, (a, b, c) => {
      return Object.assign({}, a, b, c);
    })(componentClass);
}
