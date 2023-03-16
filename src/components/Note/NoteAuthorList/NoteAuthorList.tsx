import classNames from "classnames";
import {UserAvatar} from "../../BoardUsers";
import {Participant, ParticipantRole} from "../../../types/participant";
import "./NoteAuthorList.scss";
import {Auth} from "../../../types/auth";

type Props = {
  // essentially Array<Participant & {displayName: string, isSelf: boolean}> but that sadly doesn't work
  authors: {displayName: string; isSelf: boolean; user?: Auth; connected?: boolean; ready?: boolean; raisedHand?: boolean; showHiddenColumns?: boolean; role?: ParticipantRole}[];
  showAuthors: boolean;
  viewer: Participant;
};
export const NoteAuthorList = (props: Props) => {
  // expected behaviour:
  // 1 => p
  // 2 => p p
  // 3 => p p p
  // 4 => (2) p p
  // n where n >= 4 => (n - 2) p p
  // where (n) displays a number and p displays an avatar
  const SHOW_MAX_AUTHORS = 3;
  const stackAuthor = props.authors[0];
  const restAuthors = props.authors.slice();
  const slicedAuthors = restAuthors.splice(0, props.authors.length > SHOW_MAX_AUTHORS ? SHOW_MAX_AUTHORS - 1 : SHOW_MAX_AUTHORS); // max first n authors
  const restUsersExist = restAuthors.length > 0;
  return props.showAuthors || props.viewer.user.id === stackAuthor.user!.id ? (
    <div className="note-author-list">
      {slicedAuthors.map(
        (
          a // iterate over authors, order is changed in CSS
        ) => (
          // TODO: think about --self class behaviour, I chose to set the whole list with a background if yourself is author
          <figure className={classNames("note__author", {"note__author--self": stackAuthor.isSelf, "note__author--with-rest": restUsersExist})} aria-roledescription="author">
            <UserAvatar id={a.user!.id} avatar={a.user!.avatar} title={a.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
            {a.user!.id === stackAuthor.user!.id ? ( // only the stack authors name is displayed
              <figcaption className="note__author-name">{a.displayName}</figcaption>
            ) : null}
          </figure>
        )
      )}
      {restUsersExist && <div className="note__author--others">{restAuthors.length}</div>}
    </div>
  ) : null;
};
