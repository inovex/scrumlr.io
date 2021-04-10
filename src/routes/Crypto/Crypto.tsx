function Crypto() {
  const downloadKeypair = () => {
    const element = document.createElement("a");
    const file = new Blob(["test foobar"], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = "secret.jwks";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const uploadFile = (event: any) => {
    const file = event.target.files[0];
    console.log(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      console.log("CONTENT", evt.target!.result);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <section>
        <h1>Keygen</h1>

        <button>Generate new keypair</button>
        <button>Load existing keypair</button>

        <button onClick={downloadKeypair}>Download keypair</button>
        <input type="file" name="myFile" onChange={uploadFile} />
      </section>
      <section>
        <h1>Symmetric Key</h1>
      </section>
    </>
  );
}

export default Crypto;
