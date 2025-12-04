import {Auth, ParticipantWithUser, ParticipantWithUserId} from "../store/features";

export const mapMultipleParticipants = (participants: ParticipantWithUserId[], userData: Auth[]): ParticipantWithUser[] => {
  const mappedParticipants: ParticipantWithUser[] = participants.map((participant: ParticipantWithUserId) => {
    const user = userData.find((u) => u.id === participant.id);
    if (!user) throw new Error(`User with id ${participant.id} not found`);

    return {
      user: {...user},
      ...participant,
    };
  });

  return mappedParticipants;
};

export const mapSingleParticipant = (participant: ParticipantWithUserId, userData: Auth): ParticipantWithUser => ({
  ...participant,
  user: {...userData},
});
