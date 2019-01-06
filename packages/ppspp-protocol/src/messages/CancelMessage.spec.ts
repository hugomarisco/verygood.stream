import { ChunkSpec } from "../fields/ChunkSpec";
import { CancelMessage } from "./CancelMessage";

describe("CancelMessage", () => {
  test("should encode the message", () => {
    const message = new CancelMessage(
      1,
      new ChunkSpec([2, 2]),
    );

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x09,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x00,
      0x00,
      0x02,
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
