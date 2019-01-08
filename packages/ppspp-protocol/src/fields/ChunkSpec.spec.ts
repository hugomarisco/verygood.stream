import { ChunkSpec } from "./ChunkSpec";

describe("ChunkSpec", () => {
  test("should encode bin specs", () => {
    const field = new ChunkSpec(2);

    const expected = Buffer.from([0x00, 0x00, 0x00, 0x02]);

    expect(field.encode()).toEqual(expected);
  });

  test("should encode byte range specs", () => {
    const field = new ChunkSpec([2, 3]);

    const expected = Buffer.from([0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x03]);

    expect(field.encode()).toEqual(expected);
  });

  test("should return the byte length for bin specs", () => {
    const field = new ChunkSpec(2);

    expect(field.byteLength()).toEqual(4);
  });

  test("should return the byte length for byte range specs", () => {
    const field = new ChunkSpec([2, 3]);

    expect(field.byteLength()).toEqual(8);
  });
});
