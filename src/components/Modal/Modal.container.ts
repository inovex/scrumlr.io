import { Dispatch } from 'redux';
import { MODAL_STATUS } from '../../actions';
import { DispatchModalProps } from './Modal';

export function mapDispatchToProps(
  dispatch: Dispatch<any>
): DispatchModalProps {
  return {
    onStatus: (active: boolean) => {
      dispatch({ type: MODAL_STATUS, isActive: active });
    }
  };
}
