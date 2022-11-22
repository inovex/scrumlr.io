import "./ExternalAvatar.scss";

export interface ExternalAvatarProps {
  name: string;
}

export const ExternalAvatar = ({name}: ExternalAvatarProps) => (
    <div className="external-avatar">
      <label>{name.charAt(0).toUpperCase()}</label>
    </div>
  );
