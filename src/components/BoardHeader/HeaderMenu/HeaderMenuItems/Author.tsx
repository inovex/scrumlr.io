import store, {useAppSelector} from "store";
import {ApplicationState} from "types/store";
import {ActionFactory} from "store/action";
import "./HeaderMenuItems.scss";
import classNames from "classnames";

export type AuthorProps = {};

export const Author = (props: AuthorProps) => {
  const state = useAppSelector((applicationState: ApplicationState) => ({
    board: applicationState.board.data!,
  }));

  return (
    <div className="menu__item-button" id="author">
      <li className="header-menu__item">
        <button
          className="menu__item-button"
          onClick={() => {
            store.dispatch(ActionFactory.editBoard({id: state.board!.id, showAuthors: !state.board!.showAuthors}));
          }}
        >
          <div className="item-button__toggle-container">
            <div
              className={classNames("item-button__toggle", {"item-button__toggle--left": state.board!.showAuthors}, {"item-button__toggle--right": !state.board!.showAuthors})}
            />
          </div>
          <label className="item-button__label">{state.board!.showAuthors ? "Hide" : "Show"} authors of card</label>
        </button>
      </li>
    </div>
  );
};
