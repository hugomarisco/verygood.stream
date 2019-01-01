export class ChunkSpec {
  public spec: number | [number, number];

  constructor(spec: number | [number, number]) {
    this.spec = spec;
  }

  public encode() {
    let chunkSpecBuffer;

    if (typeof this.spec === "number") {
      chunkSpecBuffer = Buffer.alloc(4);
      chunkSpecBuffer.writeUInt32BE(this.spec as number, 0);
    } else {
      chunkSpecBuffer = Buffer.alloc(8);
      const [chunkStart, chunkEnd] = this.spec as number[];

      chunkSpecBuffer.writeUInt32BE(chunkStart, 0);
      chunkSpecBuffer.writeUInt32BE(chunkEnd, 4);
    }

    return chunkSpecBuffer;
  }

  public byteLength() {
    if (typeof this.spec === "number") {
      return 4;
    } else {
      return 8;
    }
  }
}