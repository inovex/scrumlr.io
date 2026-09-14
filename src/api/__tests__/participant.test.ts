import {vi} from "vitest";
import * as config from "config";
import {ParticipantsAPI} from "../participant";

describe("ParticipantsAPI", () => {
  beforeEach(() => {
    vi.spyOn(config, "SERVER_HTTP_URL", "get").mockReturnValue("http://localhost:8080");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("joinBoard returns BANNED when backend returns a prefixed board error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 403,
      redirected: false,
      json: vi.fn().mockResolvedValue({
        status: "Forbidden.",
        error: "board error [FORBIDDEN]: participant is currently banned from this session",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(ParticipantsAPI.joinBoard("board-id")).resolves.toEqual({status: "BANNED"});
  });

  it("joinBoard returns PASSPHRASE_REQUIRED for first passphrase challenge", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 400,
      redirected: false,
      json: vi.fn().mockResolvedValue({
        status: "Bad request.",
        error: "missing passphrase",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(ParticipantsAPI.joinBoard("board-id")).resolves.toEqual({status: "PASSPHRASE_REQUIRED"});
  });

  it("joinBoard returns WRONG_PASSPHRASE when passphrase is provided and rejected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 400,
      redirected: false,
      json: vi.fn().mockResolvedValue({
        status: "Bad request.",
        error: "wrong passphrase",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(ParticipantsAPI.joinBoard("board-id", "wrong")).resolves.toEqual({status: "WRONG_PASSPHRASE"});
  });
});
