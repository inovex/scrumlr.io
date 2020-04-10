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
            featuredTemplates: Templates;
            allTemplates: Templates;
            myTemplates: Templates;
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
    /** Access to members must be acknowledged before they can join a board, when this property is set to `true`. */
    admissionControl: boolean;

    /** Input data will be encrypted in the database. */
    encryptedData: boolean;

    /** Reference to a board template id. */
    template: string;

    /** Reference to the creators user id. */
    owner: string;

    /** ISO string of creation date. */
    creationDate: string;

    voteLimit?: number;
}

export interface Members {
    [key: string]: Member;
}

export interface Member {
    admin: boolean;
    markedAsDone?: boolean;
    votes?: string[];
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

export interface Card {
    column: string;
    text: string;
    author: string;
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

export interface Column {
    name: string;
    visible: boolean;
    index?: number;
}

interface Templates {
    [key: string]: Template;
}

export interface Template {
    name: string;
    description?: string | null;
    creator: string;
    creationDate: string;
    featured: boolean;
    columns: [
        {
            name: string;
            visible: boolean;
        }
    ];
}
