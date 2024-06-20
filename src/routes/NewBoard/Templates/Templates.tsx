import "./Templates.scss";

export const Templates = () => (
  <div className="templates">
    {/* TODO: display saved templates only when user isn't anonymous (blocked by #4229) */}
    <div className="templates__container templates__container--saved">
      <div className="templates__container-title">Your templates</div>
    </div>
    <div className="templates__container templates__contaner--recommended">
      <div className="templates__container-title">Our Recommendations</div>
    </div>
  </div>
);
