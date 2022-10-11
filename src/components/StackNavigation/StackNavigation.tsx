import {FC} from "react";
import {useNavigate} from "react-router";
import {Note} from "types/note";
import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import "./StackNavigation.scss";
import {StackNavigationDots} from "./Dots/StackNavigationDots";

interface StackNavigationProps {
  stacks: Note[];
  currentStack: string;
}

export const StackNavigation: FC<StackNavigationProps> = ({stacks, currentStack}: StackNavigationProps) => {
  const navigate = useNavigate();
  const currentIndex = stacks.findIndex((s) => s.id === currentStack);

  const handleBackClick = () => {
    navigate(`../note/${stacks[currentIndex - 1].id}/stack`);
  };

  const handleForwardClick = () => {
    navigate(`../note/${stacks[currentIndex + 1].id}/stack`);
  };

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
    <div className="stack-view__navigation" onClick={(e) => e.stopPropagation()}>
      <button disabled={currentIndex === 0} onClick={handleBackClick} className="stack-view__navigation-button">
        <LeftArrowIcon />
      </button>
      <StackNavigationDots stacks={stacks} currentIndex={currentIndex} />
      <button disabled={currentIndex === stacks.length - 1} onClick={handleForwardClick} className="stack-view__navigation-button">
        <RightArrowIcon />
      </button>
    </div>
  );
};
