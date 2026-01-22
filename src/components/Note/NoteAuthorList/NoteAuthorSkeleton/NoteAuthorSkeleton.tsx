import "./NoteAuthorSkeleton.scss";
import stanAvatar from "assets/stan/Stan_Avatar.png";
import {getRandomNameWithSeed} from "utils/random";
import classNames from "classnames";

interface NoteAuthorSkeletonProps {
  authorID?: string;
}

export const NoteAuthorSkeleton = ({authorID}: NoteAuthorSkeletonProps) => (
  <div className="note-author-skeleton">
    <div className="note-author-skeleton__avatar">
      <img src={stanAvatar} alt="Note Author" className="note-author-skeleton__avatar" />
    </div>
    {authorID ? <div className={classNames("note__author-name")}>{getRandomNameWithSeed(authorID)}</div> : <div className="note__author-name" />}
  </div>
);
