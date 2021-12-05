import {fireEvent, waitFor} from "@testing-library/react";
import {AccessPolicySelection} from "components/AccessPolicySelection/AccessPolicySelection";
import {AccessPolicy} from "types/board";
import {render} from "testUtils";

describe("AccessPolicySelection", () => {
  test("dont show passphrase input on default state", () => {
    const {container} = render(<AccessPolicySelection accessPolicy={AccessPolicy.Public} onAccessPolicyChange={jest.fn()} passphrase="" onPassphraseChange={jest.fn()} />);
    expect(container.querySelector(`[data-testid="passphrase-input"]`)).toBeNull();
  });

  test("show passphrase input on access policy by passphrase", () => {
    const {container} = render(<AccessPolicySelection accessPolicy={AccessPolicy.ByPassphrase} onAccessPolicyChange={jest.fn()} passphrase="" onPassphraseChange={jest.fn()} />);
    expect(container.querySelector(`[data-testid="passphrase-input"]`)).toBeDefined();
  });

  test("trigger on change on passphrase change", async () => {
    const onChangeOfPassphrase = jest.fn();
    const {container} = render(
      <AccessPolicySelection accessPolicy={AccessPolicy.ByPassphrase} onAccessPolicyChange={jest.fn()} passphrase="" onPassphraseChange={onChangeOfPassphrase} />
    );

    fireEvent.change(container.querySelector(`[data-testid="passphrase-input"]`)!, {target: {value: "1234"}});

    await waitFor(() => {
      expect(onChangeOfPassphrase).toHaveBeenCalled();
    });
  });

  test("trigger on password change when random generator is clicked", async () => {
    const onChangeOfPassphrase = jest.fn();
    const {container} = render(
      <AccessPolicySelection accessPolicy={AccessPolicy.ByPassphrase} onAccessPolicyChange={jest.fn()} passphrase="" onPassphraseChange={onChangeOfPassphrase} />
    );

    fireEvent.click(container.querySelector(`[data-testid="random-passwort-generator"]`)!);

    await waitFor(() => {
      expect(onChangeOfPassphrase).toHaveBeenCalled();
    });
  });
});
