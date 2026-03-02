export interface DragLockState {
  lockedNotes: Record<string, string>; // noteId -> userId
}

export interface NoteDragEvent {
  noteId: string;
  userId: string;
}
