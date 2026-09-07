import {Mock} from "vitest";
import {API} from "api";
import getTestStore from "utils/test/getTestStore";
import {Toast} from "utils/Toast";
import {signOut} from "../thunks";

vi.mock("api", () => ({API: {signOut: vi.fn()}}));
vi.mock("utils/Toast", () => ({
  Toast: {
    error: vi.fn(),
  },
}));

describe("auth thunks", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("waits for the server before redirecting after logout", async () => {
    let resolveSignOut!: () => void;
    const signOutRequest = new Promise<void>((resolve) => {
      resolveSignOut = resolve;
    });
    (API.signOut as Mock).mockReturnValue(signOutRequest);
    const replace = vi.spyOn(window.location, "replace").mockImplementation(() => undefined);
    const user = {id: "user-id", name: "User", isAnonymous: true};
    const store = getTestStore({auth: {initializationSucceeded: true, user}});

    const action = store.dispatch(signOut());
    await vi.waitFor(() => expect(API.signOut).toHaveBeenCalledOnce());

    expect(replace).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toEqual(user);

    resolveSignOut();
    const result = await action;

    expect(signOut.fulfilled.match(result)).toBe(true);
    expect(replace).toHaveBeenCalledWith("/login");
    expect(store.getState().auth.user).toEqual(user);
  });

  it("keeps the user and offers a retry when logout fails", async () => {
    const error = new Error("Sign out failed");
    (API.signOut as Mock).mockRejectedValue(error);
    const replace = vi.spyOn(window.location, "replace").mockImplementation(() => undefined);
    const user = {id: "user-id", name: "User", isAnonymous: true};
    const store = getTestStore({auth: {initializationSucceeded: true, user}});

    const result = await store.dispatch(signOut());

    expect(API.signOut).toHaveBeenCalledOnce();
    expect(signOut.rejected.match(result)).toBe(true);
    expect(replace).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toEqual(user);
    expect(Toast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        buttons: expect.arrayContaining([expect.any(String)]),
        firstButtonOnClick: expect.any(Function),
      })
    );
  });

  // The toast retry dispatches a new signOut thunk, which must perform the
  // post-logout redirect independently of the original rejected dispatch.
  it("redirects after a successful logout retry", async () => {
    const error = new Error("Sign out failed");
    (API.signOut as Mock).mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
    const replace = vi.spyOn(window.location, "replace").mockImplementation(() => undefined);
    const user = {id: "user-id", name: "User", isAnonymous: true};
    const store = getTestStore({auth: {initializationSucceeded: true, user}});

    const result = await store.dispatch(signOut());

    expect(signOut.rejected.match(result)).toBe(true);
    expect(replace).not.toHaveBeenCalled();

    const toastOptions = vi.mocked(Toast.error).mock.calls[0][0];
    toastOptions.firstButtonOnClick?.();

    await vi.waitFor(() => {
      expect(API.signOut).toHaveBeenCalledTimes(2);
      expect(replace).toHaveBeenCalledWith("/login");
    });
    expect(store.getState().auth.user).toEqual(user);
  });
});
