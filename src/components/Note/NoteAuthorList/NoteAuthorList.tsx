import classNames from "classnames";
import {Participant, ParticipantExtendedInfo} from "types/participant";
import {useTranslation} from "react-i18next";
import {UserAvatar} from "../../BoardUsers";
import "./NoteAuthorList.scss";
import {NoteAuthorSkeleton} from "./NoteAuthorSkeleton/NoteAuthorSkeleton";

type NoteAuthorListProps = {
  authors: Participant[];
  showAuthors: boolean;
  viewer: Participant;
};
export const NoteAuthorList = (props: NoteAuthorListProps) => {
  const {t} = useTranslation();

  if (!props.authors[0] || props.authors.length === 0) {
    return <NoteAuthorSkeleton />;
  }

  // next to the Participant object there's also helper properties (displayName, isSelf) for easier identification.
  const prepareAuthors = (authors: Participant[]): ParticipantExtendedInfo[] => {
    const allAuthors = authors
      .map((a) => {
        const isSelf = a?.user.id === props.viewer.user.id; // assertion: viewer is self
        const displayName = isSelf ? t("Note.me") : a.user.name;
        return {
          ...a,
          displayName,
          isSelf,
        } as ParticipantExtendedInfo;
      })
      // remove duplicates (because notes can have multiple children by the same authors)
      .filter((v, i, self) => self.findIndex((a) => a.user?.id === v.user?.id) === i);

    // if self is part of the authors, we always want it to be visible
    const selfIndex = allAuthors.findIndex((a) => a.isSelf);
    if (selfIndex > 1) {
      // in-place swap with second author
      [allAuthors[selfIndex], allAuthors[1]] = [allAuthors[1], allAuthors[selfIndex]];
    }

    // if showAuthors is disabled, we still want to see cards written by yourself if you're the stack author.
    // the other authors are excluded as we only require the stack author
    if (!props.showAuthors && props.viewer.user.id === props.authors[0].user.id) {
      return [allAuthors[0]]; // stack author is always first element
    }

    return allAuthors;
  };
  const authorExtendedInfo = prepareAuthors(props.authors);
  // expected behaviour:
  // 1 => avatar1 name
  // 2 => avatar1 name avatar2
  // 3 => avatar1 name avatar2 avatar3
  // 4 => avatar1 name avatar2 avatar3 avatar4
  // n where n >= 4 => avatar1 name  avatar2 avatar3 (n - 2)
  // where (n) displays a number
  const SHOW_MAX_AUTHORS = 3;
  const stackAuthor = authorExtendedInfo[0];
  const restAuthors = authorExtendedInfo.slice(1);
  const slicedAuthors = restAuthors.splice(0, authorExtendedInfo.length - 1 > SHOW_MAX_AUTHORS ? SHOW_MAX_AUTHORS - 1 : SHOW_MAX_AUTHORS); // max first n authors
  const restUsersExist = restAuthors.length > 0;
  const restUsersTitle = restAuthors.map((a) => a.displayName).join("\x0A"); // join names with line breaks

  const authorVisible = props.showAuthors || stackAuthor.isSelf;
  if (!authorVisible) {
    return <NoteAuthorSkeleton />;
  }

  return (
    <div className="note-author-list">
      <div className={classNames("note-author__container", {"note-author__container--self": stackAuthor.isSelf})}>
        <figure
          className={classNames("note__author", {
            "note__author--self": stackAuthor.isSelf,
          })}
          aria-roledescription="author"
          key={stackAuthor.user!.id}
        >
          <UserAvatar
            id={stackAuthor.user!.id}
            avatar={stackAuthor.user!.avatar}
            title={stackAuthor.displayName}
            className="note__user-avatar"
            avatarClassName="note__user-avatar"
          />
        </figure>

        <div className={classNames("note__author-name", {"note__author-name--self": stackAuthor.isSelf})}>{stackAuthor.displayName}</div>
      </div>

      <div className="note-rest-authors__container">
        {slicedAuthors.map((a) => (
          <figure className="note__author" aria-roledescription="author" key={a.user!.id}>
            <UserAvatar id={a.user!.id} avatar={a.user!.avatar} title={a.displayName} className="note__user-avatar" avatarClassName="note__user-avatar" />
          </figure>
        ))}

        {restUsersExist && (
          <figure className={classNames("note-author-rest", {"note-author-rest--self": stackAuthor.isSelf})} title={restUsersTitle}>
            {restAuthors.length}
          </figure>
        )}
      </div>
    </div>
  );
};
