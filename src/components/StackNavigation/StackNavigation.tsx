import {FC, useEffect} from "react";
import {useNavigate} from "react-router";
import {Note} from "types/note";
import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import "./StackNavigation.scss";
import {StackNavigationDots} from "./Dots/StackNavigationDots";

interface StackNavigationProps {
  stacks: Note[];
  currentStack: string;
  prevColumnStack: string | undefined;
  nextColumnStack: string | undefined;
  handleModeration: (stackId: string) => void;
}

export const StackNavigation: FC<StackNavigationProps> = ({stacks, currentStack, prevColumnStack, nextColumnStack, handleModeration}: StackNavigationProps) => {
  const navigate = useNavigate();
  const currentIndex = stacks.findIndex((s) => s.id === currentStack);

  const handleBackClick = () => {
    if (currentIndex > 0) {
      handleModeration(stacks[currentIndex - 1].id);
      navigate(`../note/${stacks[currentIndex - 1].id}/stack`);
    } else if (prevColumnStack) {
      handleModeration(prevColumnStack);
      navigate(`../note/${prevColumnStack}/stack`);
    }
  };

  const handleForwardClick = () => {
    if (currentIndex < stacks.length - 1) {
      handleModeration(stacks[currentIndex + 1].id);
      navigate(`../note/${stacks[currentIndex + 1].id}/stack`);
    } else if (nextColumnStack) {
      handleModeration(nextColumnStack);
      navigate(`../note/${nextColumnStack}/stack`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleBackClick();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      handleForwardClick();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
    <div className="stack-view__navigation">
      <button
        disabled={currentIndex === 0 && prevColumnStack === undefined}
        onClick={(e) => {
          e.stopPropagation();
          handleBackClick();
        }}
        className="stack-view__navigation-button"
      >
        <LeftArrowIcon />
      </button>
      <StackNavigationDots stacks={stacks} currentIndex={currentIndex} handleModeration={handleModeration} />
      <button
        disabled={currentIndex === stacks.length - 1 && nextColumnStack === undefined}
        onClick={(e) => {
          e.stopPropagation();
          handleForwardClick();
        }}
        className="stack-view__navigation-button"
      >
        <RightArrowIcon />
      </button>
    </div>
  );
};
