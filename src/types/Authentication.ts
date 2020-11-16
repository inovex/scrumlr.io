export default interface Authentication {
    uid: string | null;
    displayName: string | null;
    photoUrl: string | null;
    isAnonymous: boolean;
};