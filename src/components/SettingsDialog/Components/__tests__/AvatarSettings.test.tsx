import {screen, render, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {Provider} from "react-redux";
import {I18nextProvider} from "react-i18next";
import {API} from "api";
import i18n from "i18nTest";
import {generateRandomProps} from "components/Avatar";
import {Auth} from "store/features";
import {AvataaarProps} from "types/avatar";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {AvatarSettings} from "../AvatarSettings";

const userId = "test-auth-user-id";
const completeAvatar = generateRandomProps(userId);

const renderAvatarSettings = (avatar: AvataaarProps | null | undefined) => {
  const auth = {...getTestApplicationState().auth.user!, avatar} as Auth;
  const store = getTestStore({auth: {user: auth, initializationSucceeded: true}});

  render(
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <AvatarSettings id={userId} />
      </Provider>
    </I18nextProvider>
  );

  return {auth, store};
};

describe("AvatarSettings", () => {
  beforeEach(() => {
    vi.spyOn(API, "editUser").mockImplementation(async (auth) => auth);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("does not update a complete persisted avatar when mounted", () => {
    const {auth, store} = renderAvatarSettings(completeAvatar);

    expect(API.editUser).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toBe(auth);
  });

  test("updates a changed avatar exactly once and preserves the remaining user data", async () => {
    const randomValue = 0.5;
    const nextAvatar = generateRandomProps(randomValue.toString(36).slice(2));
    vi.spyOn(Math, "random").mockReturnValue(randomValue);
    const {auth, store} = renderAvatarSettings(completeAvatar);

    await userEvent.click(screen.getByRole("button", {name: "Generate random avatar"}));

    await waitFor(() => expect(API.editUser).toHaveBeenCalledTimes(1));
    expect(API.editUser).toHaveBeenCalledWith({...auth, avatar: nextAvatar});
    expect(store.getState().auth.user).toEqual({...auth, avatar: nextAvatar});
  });

  test("persists an old avatar without a background color exactly once", async () => {
    const {backgroundColor: _backgroundColor, ...oldAvatar} = completeAvatar;
    const {auth, store} = renderAvatarSettings(oldAvatar as AvataaarProps);

    await waitFor(() => expect(API.editUser).toHaveBeenCalledTimes(1));
    const migratedAvatar = {...oldAvatar, backgroundColor: completeAvatar.backgroundColor};
    expect(API.editUser).toHaveBeenCalledWith({...auth, avatar: migratedAvatar});
    expect(store.getState().auth.user?.avatar).toEqual(migratedAvatar);
  });

  test.each([null, undefined])("persists a generated avatar when the stored avatar is %s", async (avatar) => {
    const {auth, store} = renderAvatarSettings(avatar);

    await waitFor(() => expect(API.editUser).toHaveBeenCalledTimes(1));
    expect(API.editUser).toHaveBeenCalledWith({...auth, avatar: completeAvatar});
    expect(store.getState().auth.user?.avatar).toEqual(completeAvatar);
  });

  test("does not update when shuffle produces the current avatar", async () => {
    const randomValue = 0.25;
    const avatar = generateRandomProps(randomValue.toString(36).slice(2));
    vi.spyOn(Math, "random").mockReturnValue(randomValue);
    const {auth, store} = renderAvatarSettings(avatar);

    await userEvent.click(screen.getByRole("button", {name: "Generate random avatar"}));

    expect(API.editUser).not.toHaveBeenCalled();
    expect(store.getState().auth.user).toBe(auth);
  });
});
