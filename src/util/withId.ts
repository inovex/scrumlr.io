export const mapWithId = <T>(data: { [id: string]: T } | null): WithId<T>[] => {
    if (!data) {
        return [];
    }
    return Object.entries(data).map(([id, object]) => ({
        id,
        ...object
    }));
};

export type WithId<T extends {}> = T & {
    id: string;
};

export default WithId;
