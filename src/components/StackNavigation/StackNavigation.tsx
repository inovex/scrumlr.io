import {FC, useEffect} from "react";
import {useNavigate} from "react-router";
import {Note} from "store/features/notes/types";
import {ArrowRight, ArrowLeft} from "components/Icon";
import "./StackNavigation.scss";
import {useTranslation} from "react-i18next";
import {useAppSelector} from "store";
import {StackNavigationDots} from "./Dots/StackNavigationDots";

interface StackNavigationProps {
  stacks: Note[];
  currentStack: string;
  prevColumnStack?: string;
  nextColumnStack?: string;
  handleModeration: (stackId: string) => void;
}

export const StackNavigation: FC<StackNavigationProps> = ({stacks, currentStack, prevColumnStack, nextColumnStack, handleModeration}: StackNavigationProps) => {
  const {t} = useTranslation();
  const noteFocus = useAppSelector((s) => s.view.noteFocused);

  const navigate = useNavigate();
  const currentIndex = stacks.findIndex((s) => s.id === currentStack);

  const getStackId = (index: number): string | undefined => {
    if (stacks[index]) return stacks[index].id; // if a stack in the current column exists at the given index, return its id
    return index < 0 ? prevColumnStack : nextColumnStack; // if the index is out of bounds, return the id of the first/last stack in the previous/next column
  };

  // takes the index of the stack we want to navigate to
  // if the index is out of bounds, it will navigate to the previous or next column, animated using the View Transition API
  const handleNavigation = (index: number) => {
    const stackId = getStackId(index);
    if (stackId) {
      if (stacks[index] || !document.startViewTransition) {
        handleModeration(stackId);
        navigate(`../note/${stackId}/stack`);
      } else
        document.startViewTransition(() => {
          handleModeration(stackId);
          navigate(`../note/${stackId}/stack`);
        });
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!noteFocus) {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        handleNavigation(currentIndex - 1);
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        handleNavigation(currentIndex + 1);
      }
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
        aria-label={t("StackView.prevNote")}
      >
        <ArrowLeft
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
        aria-label={t("StackView.nextNote")}
      >
        <ArrowRight
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation(currentIndex + 1);
          }}
        />
      </button>
    </div>
  );
};
