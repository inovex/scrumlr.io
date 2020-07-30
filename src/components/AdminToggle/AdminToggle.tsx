import * as React from 'react';
import './AdminToggle.scss';
import { UserInformation } from '../../types';
import Checkbox from '../Checkbox';
import { connect } from 'react-redux';
import { mapStateToProps } from './AdminToggle.container';

export interface OwnAdminToggleProps {
  boardUrl: string;
  adminToggleIsVisible: boolean;
  user: UserInformation & { id: string };
}

export interface StateAdminToggleProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  disabled: boolean;
}

export type AdminToggleProps = OwnAdminToggleProps & StateAdminToggleProps;

export class AdminToggle extends React.Component<AdminToggleProps, {}> {
  render() {
    const { isAdmin, onToggleAdmin, disabled } = this.props;

    return (
      <div className="user-admin__admin-state-wrapper">
        <Checkbox
          onChange={onToggleAdmin}
          checked={Boolean(isAdmin)}
          disabled={disabled}
          className="user-admin__admin-checkbox"
        >
          Admin
        </Checkbox>
      </div>
    );
  }
}

export default connect<StateAdminToggleProps, null, OwnAdminToggleProps>(
  mapStateToProps
)(AdminToggle);
