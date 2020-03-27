export interface ApplicationState {
    firebase: {
        auth: FirebaseAuth;
    };
    firestore: {
        data: {
            boards: Boards;
            members: Members;
            pending: PendingList;
            cards: Cards;
            columns: Columns;
            settings: Settings;
            users: Users;
            templates: Templates;
        };
    };
}

interface FirebaseAuth {
    uid: string | null;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
    isAnonymous: boolean;
}

interface Users {
    [key: string]: User;
}

interface User {
    displayName: string | undefined;
    profileImage: string | undefined;
    email: string | undefined;
}

interface Boards {
    [key: string]: Board;
}

export interface Board {
    secure: boolean;
}

interface Members {
    [key: string]: Member;
}

interface Member {
    admin: boolean;
    markedAsDone?: boolean;
}

interface PendingList {
    [key: string]: PendingUser;
}

interface PendingUser {
    approved: boolean;
    publicKey: boolean;
}

interface Cards {
    [key: string]: Card;
}

interface Card {
    column: string;
    text: string;
    author: string; // reference
}

interface Settings {
    general: GeneralSettings;
}

interface GeneralSettings {
    template: string | undefined; // reference
    creator: string; // reference
    name: string;
}

interface Columns {
    [key: string]: Column;
}

interface Column {
    name: string;
    visible: boolean;
    index: number;
}

interface Templates {
    [key: string]: Template;
}

export interface Template {
    name: string;
    featured: boolean;
    columns: [
        {
            name: string;
            visible: boolean;
        }
    ];
}
