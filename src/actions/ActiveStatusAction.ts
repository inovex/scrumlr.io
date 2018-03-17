import { Action } from 'redux';

export interface ActiveStatusAction extends Action {
  isActive: boolean;
}
