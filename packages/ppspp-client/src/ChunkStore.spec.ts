import { ChunkSpec } from "@bitstreamy/ppspp-protocol";
import { ChunkStore } from "./ChunkStore";

let chunkStore: ChunkStore;

describe("ChunkStore", () => {
  beforeEach(() => {
    chunkStore = new ChunkStore(10);
  });

  describe("#getChunks", () => {
    test("it should return an empty array if the spec isn't a tuple", () => {
      expect(chunkStore.getChunks(new ChunkSpec(1))).toEqual([]);
    });

    test("it should return an empty array if the chunks are not available", () => {
      expect(chunkStore.getChunks(new ChunkSpec([1, 2]))).toEqual([]);
    });

    test("it should return an array with the requested chunks", () => {
      const data = [Buffer.from("a"), Buffer.from("b"), Buffer.from("c")];

      chunkStore.setChunks(new ChunkSpec([0, 2]), data);

      expect(chunkStore.getChunks(new ChunkSpec([0, 0]))).toEqual(
        data.slice(0, 1)
      );
      expect(chunkStore.getChunks(new ChunkSpec([0, 1]))).toEqual(
        data.slice(0, 2)
      );
      expect(chunkStore.getChunks(new ChunkSpec([1, 2]))).toEqual(
        data.slice(1, 3)
      );
    });
  });

  describe("#setChunks", () => {
    test("it should store the init segment if chunk spec is [0xffffffff, 0xffffffff]", () => {
      const initChunkSpec = new ChunkSpec([0xffffffff, 0xffffffff]);
      const data = [Buffer.from("a")];

      chunkStore.setChunks(initChunkSpec, data);

      expect(chunkStore.getChunks(initChunkSpec)).toEqual(data);
    });
  });
});
