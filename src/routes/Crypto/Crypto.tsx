import {useEffect, useState} from "react";
import {importKeypair, initializeNewKeypair, JsonWebKeySet, loadKeypair} from "../../utils/crypto";
import PublicKeyCrypto from "../../utils/crypto/publicKeyCrypto";

function Crypto() {
  const [state, setState] = useState<{jwks?: JsonWebKeySet; publicKeyCrypto?: PublicKeyCrypto}>({});

  useEffect(() => {
    loadKeypair().then((publicKeyCrypto) => {
      if (publicKeyCrypto) {
        setState({publicKeyCrypto});
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
      setState({jwks, publicKeyCrypto});
    };
    reader.readAsBinaryString(file);
  };

  const generateNewKeypair = async () => {
    const {jwks, publicKeyCrypto} = await initializeNewKeypair();
    setState({jwks, publicKeyCrypto});
  };

  let id = null;
  if (state.jwks) {
    id = state.jwks.keys[0].n!.substring(0, 20);
  }

  return (
    <>
      <main>
        Loaded: <b>{Boolean(state.publicKeyCrypto).toString()}</b>
        <br />
        Key-ID: <b>{id}</b>...
      </main>
      <section>
        <h1>Public-Key Crypto</h1>

        <button onClick={generateNewKeypair}>Generate new keypair</button>
        <button onClick={downloadKeypair} disabled={!state.jwks}>
          Download keypair
        </button>
        <input type="file" name="myFile" onChange={uploadKeypair} />
      </section>

      <section>
        <h1>Symmetric Key</h1>
      </section>
    </>
  );
}

export default Crypto;
