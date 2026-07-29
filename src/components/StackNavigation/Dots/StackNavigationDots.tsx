import {MouseEvent} from "react";
import classNames from "classnames";
import {useNavigate} from "react-router";
import {Note} from "store/features/notes/types";
import "./StackNavigationDots.scss";

type StackNavigationDotsProps = {
  stacks: Note[];
  currentIndex: number;
  handleModeration: (stackId: string) => void;
};

const getCenterDot = (length: number, currentIndex: number) => {
  if (currentIndex < 3) {
    return 3;
  }
  if (length - currentIndex < 4) {
    return length - 4;
  }
  return currentIndex;
};

export const StackNavigationDots = ({stacks, currentIndex, handleModeration}: StackNavigationDotsProps) => {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent, index: number) => {
    event.stopPropagation();
    handleModeration(stacks[index].id);
    navigate(`../note/${stacks[index].id}/stack`);
  };

  const centerDot = getCenterDot(stacks.length, currentIndex);

  return (
    <div className="stack-view__navigation-dots">
      {stacks.map((stack, index) => {
        const distance = Math.abs(centerDot - index);
        return (
          <button
            key={stack.id}
            onClick={(e) => handleClick(e, index)}
            className={classNames("stack-view__navigation-dot", {
              "stack-view__navigation-dot--active": index === currentIndex,
              "stack-view__navigation-dot--small": distance === 3 && index !== 0 && index !== stacks.length - 1,
              "stack-view__navigation-dot--hidden": distance > 3,
            })}
            tabIndex={distance > 3 ? -1 : undefined}
            aria-label={`Go to note #${index + 1}`}
          />
        );
      })}
    </div>
  );
};
