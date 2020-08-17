import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import PasswordModal from '../../components/Modal/variant/PasswordModal';
import { AuthProvider } from '../../constants/Auth';
import { mapStateToProps } from './ImportKeys.container';
import { compose } from 'redux';

export interface ImportKeysProps
  extends RouteComponentProps<{ credentials: string }> {
  uid: string | null;
  onProviderLogin: (provider: AuthProvider) => () => void;
}

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
    window.location.hash = '/';
  };

  render() {
    return (
      <>
        <LoadingScreen />

        {this.state.showPasswordModal && (
          <PasswordModal
            // Remove the first ':' from the credentials
            credentials={this.props.match.params.credentials.slice(1)}
            onClose={this.handleCloseModal}
            onProviderLogin={this.props.onProviderLogin}
            uid={this.props.uid}
          />
        )}
      </>
    );
  }
}

export default compose(connect(mapStateToProps))(
  ImportKeys
) as React.ComponentClass<any>;
