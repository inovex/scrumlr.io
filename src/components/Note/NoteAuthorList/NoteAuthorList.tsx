import classNames from "classnames";
import {UserAvatar} from "../../BoardUsers";
import {Note} from "../../../types/note";
import {Participant} from "../../../types/participant";
import "./NoteAuthorList.scss";

type Props = {
  authors: any;
  showAuthors: boolean;
  note?: Note;
  viewer: Participant;
};
export const NoteAuthorList = (props: Props) =>
  props.showAuthors || props.viewer.user.id === props.authors[0].user!.id ? (
    <figure className={classNames("note__author", {"note__author--self": props.authors[0].isSelf})} aria-roledescription="author">
      <UserAvatar
        id={props.note!.author}
        avatar={props.authors[0].user!.avatar}
        title={props.authors[0].displayName}
        className="note__user-avatar"
        avatarClassName="note__user-avatar"
      />
      <figcaption className="note__author-name">{props.authors[0].displayName}</figcaption>
    </figure>
  ) : null;
