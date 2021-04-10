import {useEffect, useState} from "react";
import {importKeypair, initializeNewKeypair, JsonWebKeySet, loadKeypair} from "../../utils/crypto";
import PublicKeyCrypto from "../../utils/crypto/publicKeyCrypto";
import {initializeNewSymmetricKey, newInitVector, SymmetricKeyCrypto} from "../../utils/crypto/symmetricKeyCrypto";

function Crypto() {
  const [state, setState] = useState<{jwks?: JsonWebKeySet; publicKeyCrypto?: PublicKeyCrypto; symmetricKeyCrypto?: SymmetricKeyCrypto; inputValue?: string; iv?: string}>({});

  useEffect(() => {
    loadKeypair().then((publicKeyCrypto) => {
      if (publicKeyCrypto) {
        setState({...state, jwks: undefined, publicKeyCrypto});
      }
    });
  }, []);

  const downloadKeypair = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(state.jwks)], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = "secret.jwks";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const uploadKeypair = async (event: any) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const jwks = JSON.parse(evt.target!.result as any);
      const publicKeyCrypto = await importKeypair(jwks);
      setState({...state, jwks, publicKeyCrypto});
    };
    reader.readAsBinaryString(file);
  };

  const generateSymmetricKey = async () => {
    const key = await initializeNewSymmetricKey();
    setState({...state, symmetricKeyCrypto: new SymmetricKeyCrypto(key)});
  };

  const generateNewKeypair = async () => {
    const {jwks, publicKeyCrypto} = await initializeNewKeypair();
    setState({...state, jwks, publicKeyCrypto});
  };

  const generateIv = async () => {
    setState({...state, iv: await newInitVector()});
  };

  const onInputChange = (event: any) => {
    setState({...state, inputValue: event.target.value});
  };

  const encrypt = async () => {
    setState({...state, inputValue: await state.symmetricKeyCrypto?.encrypt(state.inputValue!, state.iv!)});
  };

  const decrypt = async () => {
    setState({...state, inputValue: await state.symmetricKeyCrypto?.decrypt(state.inputValue!, state.iv!)});
  };

  let id = null;
  if (state.jwks) {
    id = state.jwks.keys[0].n!.substring(0, 20);
  }

  return (
    <>
      <section>
        Loaded Public-Key: <b>{Boolean(state.publicKeyCrypto).toString()}</b>
        <br />
        Key-ID: <b>{id}</b>...
        <h1>Public-Key Crypto</h1>
        <button onClick={generateNewKeypair}>Generate new keypair</button>
        <button onClick={downloadKeypair} disabled={!state.jwks}>
          Download keypair
        </button>
        <input type="file" name="myFile" onChange={uploadKeypair} />
      </section>

      <hr />

      <section>
        Loaded Symmetric-Key: <b>{Boolean(state.symmetricKeyCrypto).toString()}</b>
        <br />
        IV: {state.iv}
        <h1>Symmetric Key</h1>
        <button onClick={generateSymmetricKey}>Generate new symmetric key</button>
        <button onClick={generateIv}>Generate new IV</button>
        <input value={state.inputValue} onChange={onInputChange} />
        <button onClick={encrypt}>Encrypt</button>
        <button onClick={decrypt}>Decrypt</button>
      </section>
    </>
  );
}

export default Crypto;
