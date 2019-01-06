import { ChunkSpec } from "../fields/ChunkSpec";
import { IntegrityMessage } from "./IntegrityMessage";

describe("IntegrityMessage", () => {
  test("should encode the message", () => {
    const message = new IntegrityMessage(
      1,
      new ChunkSpec([2, 2]),
      Buffer.from([0x0a, 0x0b])
    );

    const expected = Buffer.from([
      0x00,
      0x00,
      0x00,
      0x01,
      0x04,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x00,
      0x00,
      0x02,
      0x0a,
      0x0b
    ]);

    expect(message.encode()).toEqual(expected);
  });
});
