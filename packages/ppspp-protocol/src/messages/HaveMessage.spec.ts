import { ChunkSpec } from "../fields/ChunkSpec";
import { HaveMessage } from "./HaveMessage";

describe("HaveMessage", () => {
  test("should encode the message", () => {
    const message = new HaveMessage(1, new ChunkSpec([2, 2]));

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x03,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x00,
      0x00,
      0x02
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
