# Redux Store Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
   1. [Store](#store)
   2. [Actions](#actions)
   3. [Reducers](#reducers)
   4. [Async Thunks](#async-thunks)
3. [Scrumlr Specifics](#scrumlr-specifics)

## Introduction

Since updating redux to 2.x, the whole store had to be refactored.
So, I'd like to use the opportunity to add this little writeup on how exactly the parts play together, in order to make it easier for newer devs to understand.

### Definition

Redux is a predictable state container for JavaScript apps. It helps manage the state of the application in a single, centralized store.

### Structure

The structure of the store is defined in such a way that each feature gets their own subdirectory with all the different files,
representing one required part of a redux feature.

```
store.ts
features/
├── featureA/
│   ├── actions.ts
│   ├── reducer.ts
│   ├── thunks.ts
│   └── types.ts
└── featureB/
    ├── actions.ts
    ├── reducer.ts
    ├── thunks.ts
    └── types.ts
```

## Core Concepts

### Store

The store holds the entire state tree of the application.
It allows access to the current state and dispatches actions to modify the state.

#### Retrieving the current state

In order to access the current state, a hook is used.
We can get that value using the following code throughout the project:

```tsx
import {useAppSelector} from "store";

export const CustomComponent = () => {
  const valueA = useAppSelector((state) => state.featureA.valueA);

  return <div>Value A: {valueA}</div>;
};
```

The value is automatically updated whenever it changes in the store, causing a rerender.
It is immutable, so to change the value, an _Action_ has to be _dispatched_ first.

### Actions

Actions are plain objects describing what happened.
They consist of a `type` and an optional `payload`.
Generally, they are defined like this:

```ts
import {createAction} from "@reduxjs/toolkit";

export const exampleAction = createAction<T>("featureA/actionA");
```

where `featureA/actionA` is the name (type) and `T` is the payload type.

Let's define a simple action:

```ts
export const setValueA = createAction<number>("featureA/setValueA");
```

Actions can be dispatched.

```ts
import {useAppDispatch} from "store";

const dispatch = useAppDispatch();

dispatch(setValueA(42));
```

### Reducers

Reducers specify how the state changes in response to actions.
They are pure functions that return the next state.
There are different patterns to define reducers, we're using `builder`.

Assuming the state for `reducerA` is defined like this in `types.ts`:

```ts
export type ReducerAState = {
  valueA: number;
  arrayA: string[];
};
```

First, we define the initial state:

```ts
const initialState: ReducerAState = {valueA: 0, arrayA: []};
```

the reducer for feature A would look like this:

```ts
export const featureAReducer = createReducer(initialState, (builder) =>
  builder
    .addCase(setValueA, (state, action) => {
      state.valueA = action.payload;
    })
    .addCase(addItemWay1, (state, action) => {
      state.arrayA.push(action.payload);
    })
    .addCase(addItemWay2, (state, action) => {
      return {
        ...state,
        arrayA: [...state.arrayA, action.payload],
      };
    })
);
```

`action.payload` will automatically infer the type which was defined in the `createAction` function.
As you can see, there are multiple ways to change the state.

1. Since Redux uses [Immer](https://immerjs.github.io/immer/) internally, the state inside reducers are a writable draft.
   Thus, it is actually possible to mutate state values.
2. Alternatively, a new state may be returned directly, which is sometimes more convenient. Don't forget the other values though!

**Important**: Do not rewrite the state directly!

```ts
builder.addCase(illegalRewrite, (state, action) => {
  state = action.payload; // don't do this
});
```

This changes the reference to `state`, which doesn't lead to a correct state change.

### Async Thunks

Thunks allow for asynchronous operations by wrapping expressions into a function. See https://daveceddia.com/what-is-a-thunk/.
Because Actions are just plain objects, and reducers are pure functions, thunks allow for asynchronous code and side effects.
They are defined like this:

```ts
export const myAsyncThunk = createAsyncThunk<R, T, {state: ApplicationState}>("featureA/asyncTask", async (payload, {dispatch, getState}) => {
  const result = await API.doStuff(payload);
  dispatch(someAction(result));
});
```

There's some things to unpack here:

- `R`: return type of the thunk, if not needed just put `void`
- `T`: payload type, analog to normal actions (`void` if none)
- `{state: ApplicationState}`: tells the TS what type to infer for the store

Inside the function body, any code may be called, including API calls and other dispatch calls.
For this, `dispatch` and `getState` are can optionally be passed as parameters to the function.

It is also possible to use the return value of the thunk inside a reducer:

```ts
builder
  // pending or fulfilled
  .addCase(myAsyncThunk.fulfilled, (state, action) => {
    state.someProperty = action.payload; // make sure the thunk returns the right value
  });
```

A thunk is called like any other action:

```ts
dispatch(myAsyncThunk(someParameter));
```

## Scrumlr Specifics

For Scrumlr, you should know about some extra things:

### The `retryable` function

This function abstracts error handling and retry logic for thunks.
So for example, the above custom thunk can be wrapped:

```ts
import {retryable} from "store";

export const myAsyncThunk = createAsyncThunk<
  R,
  T,
  {
    state: ApplicationState;
  }
>("featureA/asyncTask", async (payload, {dispatch, getState}) => {
  await retryable(
    () => API.doStuff(payload),
    dispatch,
    () => myAsyncThunk(payload),
    "asyncError"
  );
});
```

Since the promise is returned, it can also be further chained using `.then()` and `.catch()`.

Maybe in the future, this could also be done using a custom middleware; feel free to do so.

### Sockets and Backend

The Scrumlr Backend uses sockets for primary communication.
For that reason, there are two socket connections:

1. **requests/thunks**: Used for initial login; closed after.
2. **board/thunks**: Used for communication with the backend concerning all changes to the board, like participants, notes, etc.

For most cases, like notes, there are two separate actions for doing a task that requires the backend to change something that affects all participants.
Adding a note flows like this:

1. user clicks a button to add a note
2. dispatch thunk `addNote`
3. thunk calls backend
4. backend adds the note to the database
5. backend emits `"NOTE_ADDED"` event to the socket
6. frontend receives `"NOTE_ADDED"` event
7. it then dispatches action `addedNote`
8. reducer catches action and adds note to `NoteState`
9. state is updated
10. components reading notes using `useAppSelector` are re-rendered
