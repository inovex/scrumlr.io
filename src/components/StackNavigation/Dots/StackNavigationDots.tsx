import classNames from "classnames";
import {useNavigate} from "react-router";
import {Note} from "types/note";
import "./StackNavigationDots.scss";

type StackNavigationDotsProps = {
  stacks: Note[];
  currentIndex: number;
};

export const StackNavigationDots = ({stacks, currentIndex}: StackNavigationDotsProps) => {
  const navigate = useNavigate();

  const handleClick = (index: number) => {
    navigate(`../note/${stacks[index].id}/stack`);
  };

  const centerDot = currentIndex < 3 ? 3 : stacks.length - currentIndex < 3 ? stacks.length - 3 : currentIndex;

  return (
    <div className="stack-view__navigation-dots">
      {stacks.map((stack, index) => {
        const distance = Math.abs(centerDot - index);
        return (
          <button
            key={stack.id}
            onClick={() => handleClick(index)}
            className={classNames(
              "stack-view__navigation-dot",
              index === currentIndex && "stack-view__navigation-dot--active",
              distance === 3 && index !== 0 && "stack-view__navigation-dot--small",
              distance > 3 && "stack-view__navigation-dot--hidden"
            )}
            aria-label={`Go to note #${index + 1}`}
          />
        );
      })}
    </div>
  );
};
