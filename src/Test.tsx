import * as React from 'react';

const JSEncrypt: any = require('jsencrypt').default;

export interface TestProps {
  publicKey?: string;
  privateKey?: string;
}

export class Test extends React.Component<any, TestProps> {
  constructor(props: any) {
    super(props);

    this.state = {};
  }

  generateKeyPair = () => {
    const encrypt = new JSEncrypt({
      default_key_size: 1024
    });

    const key = encrypt.getKey();
    this.setState({
      publicKey: key.getPublicKey(),
      privateKey: key.getPrivateKey()
    });
  };

  render() {
    return (
      <>
        <div>Key: {this.state.publicKey}</div>
        <div>Private: {this.state.privateKey}</div>
        <button onClick={this.generateKeyPair}>Generate</button>
      </>
    );
  }
}

export default Test;
