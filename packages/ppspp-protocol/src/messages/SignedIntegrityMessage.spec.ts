import { ChunkSpec } from "../fields/ChunkSpec";
import { PreciseTimestamp } from "../fields/PreciseTimestamp";
import { SignedIntegrityMessage } from "./SignedIntegrityMessage";

describe("SignedIntegrityMessage", () => {
  test("should encode the message", () => {
    const signature = Buffer.from([0x0a, 0x0b, 0x0c, 0x0d]);

    const message = new SignedIntegrityMessage(
      1,
      new ChunkSpec([2, 2]),
      new PreciseTimestamp([3, 4]),
      signature
    );

    const expected = Buffer.concat([
      Buffer.from([
        0x00,
        0x00,
        0x00,
        0x01,
        0x07,
        0x00,
        0x00,
        0x00,
        0x02,
        0x00,
        0x00,
        0x00,
        0x02,
        0x00,
        0x00,
        0x00,
        0x03,
        0x00,
        0x00,
        0x00,
        0x04
      ]),
      signature
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
