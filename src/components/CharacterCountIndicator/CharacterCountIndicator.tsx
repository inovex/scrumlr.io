import "./CharacterCountIndicator.scss";

// the indicator only appears once the input comes close to the limit to avoid visual noise
const INDICATOR_VISIBILITY_THRESHOLD = 0.75;

export const isCharacterCountVisible = (length: number, maxLength: number) =>
  length >= maxLength * INDICATOR_VISIBILITY_THRESHOLD;

type CharacterCountIndicatorProps = {
  value: string | null | undefined;
  maxLength: number;
};

export const CharacterCountIndicator = ({ value, maxLength }: CharacterCountIndicatorProps) => {
  const length = value?.length ?? 0;
  if (!isCharacterCountVisible(length, maxLength)) return null;
  return (
    <span className="character-count-indicator">
      {length}/{maxLength}
    </span>
  );
};
