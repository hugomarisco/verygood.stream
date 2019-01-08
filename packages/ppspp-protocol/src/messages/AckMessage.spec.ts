import { ChunkSpec } from "../fields/ChunkSpec";
import { PreciseTimestamp } from "../fields/PreciseTimestamp";
import { AckMessage } from "./AckMessage";

describe("AckMessage", () => {
  test("should encode the message", () => {
    const message = new AckMessage(
      1,
      new ChunkSpec([2, 2]),
      new PreciseTimestamp([3, 4])
    );

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x02,
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
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
