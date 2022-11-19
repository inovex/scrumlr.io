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

  const getStackId = (index: number): string | undefined => {
    if (stacks[index]) return stacks[index].id;
    return index < 0 ? prevColumnStack : nextColumnStack;
  };

  // takes the index of the stack we want to navigate to
  // if the index is out of bounds, it will navigate to the previous or next column
  const handleNavigation = (index: number) => {
    const stackId = getStackId(index);
    if (stackId) {
      handleModeration(stackId);
      navigate(`../note/${stackId}/stack`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      handleNavigation(currentIndex - 1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      handleNavigation(currentIndex + 1);
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
          handleNavigation(currentIndex - 1);
        }}
        className="stack-view__navigation-button"
      >
        <LeftArrowIcon
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation(currentIndex - 1);
          }}
        />
      </button>
      <StackNavigationDots stacks={stacks} currentIndex={currentIndex} handleModeration={handleModeration} />
      <button
        disabled={currentIndex === stacks.length - 1 && nextColumnStack === undefined}
        onClick={(e) => {
          e.stopPropagation();
          handleNavigation(currentIndex + 1);
        }}
        className="stack-view__navigation-button"
      >
        <RightArrowIcon
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation(currentIndex + 1);
          }}
        />
      </button>
    </div>
  );
};
