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
}

export type AdminToggleProps = OwnAdminToggleProps & StateAdminToggleProps;

export class AdminToggle extends React.Component<AdminToggleProps, {}> {
  render() {
    const { isAdmin, onToggleAdmin } = this.props;

    return (
      <div className="user-admin__admin-state-wrapper">
        <Checkbox
          onChange={onToggleAdmin}
          checked={isAdmin}
          className="user-admin__admin-checkbox"
        >
          Admin Rights
        </Checkbox>
      </div>
    );
  }
}

export default connect<StateAdminToggleProps, null, OwnAdminToggleProps>(
  mapStateToProps
)(AdminToggle);
