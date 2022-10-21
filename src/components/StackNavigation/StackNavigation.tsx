import {Dispatch, FC, SetStateAction} from "react";
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
  setAnimateDirection: Dispatch<SetStateAction<"left" | "right" | undefined>>;
}

export const StackNavigation: FC<StackNavigationProps> = ({stacks, currentStack, prevColumnStack, nextColumnStack, setAnimateDirection}: StackNavigationProps) => {
  const navigate = useNavigate();
  const currentIndex = stacks.findIndex((s) => s.id === currentStack);

  const handleBackClick = () => {
    setAnimateDirection("left");
    if (currentIndex > 0) {
      navigate(`../note/${stacks[currentIndex - 1].id}/stack`);
    } else if (prevColumnStack) navigate(`../note/${prevColumnStack}/stack`);
  };

  const handleForwardClick = () => {
    setAnimateDirection("right");
    if (currentIndex < stacks.length - 1) {
      navigate(`../note/${stacks[currentIndex + 1].id}/stack`);
    } else if (nextColumnStack) navigate(`../note/${nextColumnStack}/stack`);
  };

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
    <div className="stack-view__navigation" onClick={(e) => e.stopPropagation()}>
      <button disabled={currentIndex === 0 && prevColumnStack === undefined} onClick={handleBackClick} className="stack-view__navigation-button">
        <LeftArrowIcon />
      </button>
      <StackNavigationDots stacks={stacks} currentIndex={currentIndex} setAnimateDirection={setAnimateDirection} />
      <button disabled={currentIndex === stacks.length - 1 && nextColumnStack === undefined} onClick={handleForwardClick} className="stack-view__navigation-button">
        <RightArrowIcon />
      </button>
    </div>
  );
};
