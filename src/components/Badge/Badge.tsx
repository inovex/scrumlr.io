import "./Badge.scss";

type BadgeProps = {
  text: string;
};

export const Badge = ({text}: BadgeProps) => (
  <div className="badge">
    <span>{text}</span>
  </div>
);
