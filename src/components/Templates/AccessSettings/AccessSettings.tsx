import "./AccessSettings.scss";

export const AccessSettings = () => (
  <div className="access-settings__wrapper">
    <div className="access-settings">
      <header className="access-settings__header">Title</header>
      <main className="access-settings__main">
        <div className="access-settings__option">Open</div>
        <div className="access-settings__option">With Approval</div>
        <div className="access-settings__option">Password Protected</div>
      </main>
      <footer className="access-settings__footer">
        <button className="access-settings__cancel">Go back</button>
        <button className="access-settings__start">Start Session</button>
      </footer>
    </div>
  </div>
);
