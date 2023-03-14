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
  const stackAuthor = props.authors[0];
  return props.showAuthors || props.viewer.user.id === stackAuthor.user!.id ? (
    <div className="note-author-list">
      {props.authors.map(
        (
          a // iterate over authors, order is changed in CSS
        ) => (
          // TODO: think about --self class behaviour, I chose to set the whole list with a background if yourself is author
          <figure className={classNames("note__author", {"note__author--self": stackAuthor.isSelf})} aria-roledescription="author">
            <UserAvatar id={a.user!.id} avatar={a.user!.avatar} title={a.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
            {a.user!.id === stackAuthor.user!.id ? ( // only the stack authors name is displayed
              <figcaption className="note__author-name">{a.displayName}</figcaption>
            ) : null}
          </figure>
        )
      )}
    </div>
  ) : null;
};
