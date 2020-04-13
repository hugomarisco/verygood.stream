import { LiveSignatureAlgorithm } from "@bitstreamy/commons";
import { SwarmId } from "./SwarmId";

describe("SwarmId", () => {
  test("should correctly parse Public Key for RSASHA1", () => {
    const swarmIdBuffer = Buffer.from(
      "CAMBAAHhgi8mRfHEqRUp7ut5kxSy3DeXz8aBjox1fwEIYqg+3+aJ7UcHvd+HcMwa9LQ5vACt6nDjDWfYL6u3sSmL9v4fvmoIcNEeJ/Gx50cgyFD6rhSLPflXtvt7urVzA4N1bJvmK7cImC7qGvkA7282OnWkYerg6M9pKZFm87/SgngJXw==",
      "base64"
    );

    const swarmId = new SwarmId(swarmIdBuffer, LiveSignatureAlgorithm.RSASHA1);

    expect(swarmId.components).toEqual({
      e: Buffer.from("AQAB"),
      n: Buffer.from(
        "4YIvJkXxxKkVKe7reZMUstw3l8/GgY6MdX8BCGKoPt/mie1HB73fh3DMGvS0ObwArepw4w1n2C+rt7Epi/b+H75qCHDRHifxsedHIMhQ+q4Uiz35V7b7e7q1cwODdWyb5iu3CJgu6hr5AO9vNjp1pGHq4OjPaSmRZvO/0oJ4CV8="
      )
    });
  });
});
