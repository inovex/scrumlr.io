export interface ExternalAvatarProps {
  name: string;
  className?: string;
}

export const ExternalAvatar = ({name, className}: ExternalAvatarProps) => (
  <div className={className}>
    <label>{name.charAt(0).toUpperCase()}</label>
  </div>
);
