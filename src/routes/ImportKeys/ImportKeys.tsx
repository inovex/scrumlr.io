import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { mapStateToProps } from '../LoginBoard/LoginBoard.container';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import PasswordModal from '../../components/Modal/variant/PasswordModal';

export interface ImportKeysProps
  extends RouteComponentProps<{ credentials: string }> {}

export interface ImportKeysState {
  showPasswordModal: boolean;
}

export class ImportKeys extends Component<ImportKeysProps, ImportKeysState> {
  constructor(props: ImportKeysProps) {
    super(props);

    this.state = { showPasswordModal: true };
  }

  handleCloseModal = () => {
    this.setState({
      showPasswordModal: false
    });
  };

  render() {
    return (
      <>
        <LoadingScreen />

        {this.state.showPasswordModal && (
          <PasswordModal
            credentials={this.props.match.params.credentials}
            onClose={this.handleCloseModal}
          />
        )}
      </>
    );
  }
}

export default compose(connect(mapStateToProps))(
  ImportKeys
) as React.ComponentClass<any>;
