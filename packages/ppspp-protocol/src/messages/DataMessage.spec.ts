import { ChunkSpec } from "../fields/ChunkSpec";
import { PreciseTimestamp } from "../fields/PreciseTimestamp";
import { DataMessage } from "./DataMessage";

describe("DataMessage", () => {
  test("should encode the message", () => {
    const message = new DataMessage(
      1,
      new ChunkSpec([2, 2]),
      new PreciseTimestamp([3, 4]),
      Buffer.from([0x0a, 0x0b, 0x0c, 0x0d])
    );

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x01,
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
      0x04,
      0x0a,
      0x0b,
      0x0c,
      0x0d
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
