import "./NoteAuthorSkeleton.scss";

import stanProfile from "assets/stan/Stan_Profile.svg";

export const NoteAuthorSkeleton = () => (
  <div className="note-author-skeleton">
    <div className="note-author-skeleton__avatar">
      <img src={stanProfile} alt="Note Author" className="note-author-skeleton__avatar" />
    </div>
    <div className="note-author-skeleton__name" />
  </div>
);
