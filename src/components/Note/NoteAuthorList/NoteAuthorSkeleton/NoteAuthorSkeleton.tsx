import "./NoteAuthorSkeleton.scss";
import stanAvatar from "assets/stan/Stan_Avatar.png";

export const NoteAuthorSkeleton = () => (
  <div className="note-author-skeleton">
    <div className="note-author-skeleton__avatar">
      <img src={stanAvatar} alt="Note Author" className="note-author-skeleton__avatar" />
    </div>
    <div className="note-author-skeleton__name" />
  </div>
);
