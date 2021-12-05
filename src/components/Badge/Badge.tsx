import "./Badge.scss";

type BadgeProps = {
  text: string;
};

export var Badge = ({text}: BadgeProps) => (
  <div className="badge">
    <span>{text}</span>
  </div>
);
