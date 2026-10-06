import "./CharacterCountIndicator.scss";

// the indicator only appears once the input comes close to the limit to avoid visual noise
const INDICATOR_VISIBILITY_THRESHOLD = 0.75;

export const isCharacterCountVisible = (value: string, maxLength: number) => value.length >= maxLength * INDICATOR_VISIBILITY_THRESHOLD;

type CharacterCountIndicatorProps = {
  value: string;
  maxLength: number;
};

export const CharacterCountIndicator = ({value, maxLength}: CharacterCountIndicatorProps) => {
  if (!isCharacterCountVisible(value, maxLength)) return null;

  return (
    <span className="character-count-indicator">
      {value.length}/{maxLength}
    </span>
  );
};
