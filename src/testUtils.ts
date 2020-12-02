export type AssertTypeEqual<T, Expected> =
    T extends Expected
        ? (Expected extends T ? true : never)
        : never;