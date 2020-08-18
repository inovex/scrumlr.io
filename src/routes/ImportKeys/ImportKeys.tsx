import { Redirect, RouteComponentProps } from 'react-router';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import PasswordModal from '../../components/Modal/variant/PasswordModal';
import { AuthProvider } from '../../constants/Auth';
import { mapStateToProps } from './ImportKeys.container';
import { compose } from 'redux';
import { CRYPTO } from '../../util/global';

export interface ImportKeysProps
  extends RouteComponentProps<{ credentials: string }> {
  uid: string | null;
  onProviderLogin: (provider: AuthProvider) => () => void;
}

export interface ImportKeysState {
  showPasswordModal: boolean;
}

let credentials = '';

export class ImportKeys extends Component<ImportKeysProps, ImportKeysState> {
  constructor(props: ImportKeysProps) {
    super(props);

    this.state = { showPasswordModal: true };

    // Remove the first ':' and the checksum from the credentials
    credentials = props.match.params.credentials.slice(1);
    credentials = credentials.substr(0, credentials.lastIndexOf('_'));
  }

  handleCloseModal = () => {
    this.setState({
      showPasswordModal: false
    });
    window.location.hash = '/';
  };

  checkCredentials = () => {
    // Parameters have following format: 'publicKey_encryptedPrivateKey_iv_checksum'
    const splitParams = this.props.match.params.credentials.split('_');

    // Check if all the arguments are in place and the checksum is correct
    if (
      splitParams.length !== 4 ||
      splitParams.pop() !== CRYPTO.md5hash(credentials)
    ) {
      const warning = 'The link has been modified! Try again.';

      window.alert(warning);
      return false;
    }
    return true;
  };

  render() {
    // Redirect to main screen if the link has been tampered with
    return this.checkCredentials() ? (
      <>
        <LoadingScreen />

        {this.state.showPasswordModal && (
          <PasswordModal
            // Remove the first ':' from the credentials
            credentials={credentials}
            onClose={this.handleCloseModal}
            onProviderLogin={this.props.onProviderLogin}
            uid={this.props.uid}
          />
        )}
      </>
    ) : (
      <Redirect
        to={{
          pathname: '/'
        }}
      />
    );
  }
}

export default compose(connect(mapStateToProps))(
  ImportKeys
) as React.ComponentClass<any>;
