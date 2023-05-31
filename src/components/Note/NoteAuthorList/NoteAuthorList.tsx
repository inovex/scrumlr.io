import classNames from "classnames";
import {Participant, ParticipantExtendedInfo} from "types/participant";
import { onboardingAuthorAvatars } from "types/onboardingNotes";
import {UserAvatar} from "../../BoardUsers";
import "./NoteAuthorList.scss";


type Props = {
  authors: ParticipantExtendedInfo[];
  showAuthors: boolean;
  viewer: Participant;
};
export const NoteAuthorList = (props: Props) => {
  // expected behaviour:
  // 1 => p
  // 2 => p p
  // 3 => p p p
  // 4 => p p (2)
  // n where n >= 4 => p p (n - 2)
  // where (n) displays a number and p displays an avatar
  const SHOW_MAX_AUTHORS = 3;
  const stackAuthor = props.authors[0];
  const restAuthors = props.authors.slice();
  const slicedAuthors = restAuthors.splice(0, props.authors.length > SHOW_MAX_AUTHORS ? SHOW_MAX_AUTHORS - 1 : SHOW_MAX_AUTHORS); // max first n authors
  const restUsersExist = restAuthors.length > 0;
  const restUsersTitle = restAuthors.map((a) => a.displayName).join("\x0A"); // join names with line breaks
  const isOnboarding = window.location.pathname.startsWith("/onboarding");
  return props.showAuthors || props.viewer.user.id === stackAuthor.user!.id ? (
    <div className={classNames("note-author-list", {"note-author-list--self": stackAuthor.isSelf})}>
      {slicedAuthors.map(
        (
          a // iterate over authors, order is changed in CSS
        ) => (
          <figure
            className={classNames("note__author", {
              "note__author--self": stackAuthor.isSelf,
              "note__author--with-rest": restUsersExist,
            })}
            aria-roledescription="author"
            key={a.user!.id}
          >
            {isOnboarding ?
              <UserAvatar id={a.user!.id} avatar={
                onboardingAuthorAvatars.find((oa) => oa.onboardingAuthor === a.displayName)?.avatar ?? a.user!.avatar
              } title={a.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
             :
             <UserAvatar id={a.user!.id} avatar={a.user!.avatar} title={a.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
            }
          </figure>
        )
      )}

      {restUsersExist && (
        <figure className={classNames("note-author-rest", {"note-author-rest--self": stackAuthor.isSelf})} title={restUsersTitle}>
          {restAuthors.length}
        </figure>
      )}

      <div className={classNames("note__author-name", {"note__author-name--self": stackAuthor.isSelf})}>{stackAuthor.displayName}</div>
    </div>
  ) : null;
};
