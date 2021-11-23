import "./Badge.scss";

type BadgeProps = {
  text: string;
};

export var Badge = function ({text}: BadgeProps) {
  return (
    <div className="badge">
      <span>{text}</span>
    </div>
  );
};
