import {Mock} from "vitest";
import {API} from "api";
import getTestStore from "utils/test/getTestStore";
import {signOut} from "../thunks";

vi.mock("api", () => ({API: {signOut: vi.fn()}}));

describe("auth thunks", () => {
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
    await action;

    expect(replace).toHaveBeenCalledWith("/login");
  });
});
