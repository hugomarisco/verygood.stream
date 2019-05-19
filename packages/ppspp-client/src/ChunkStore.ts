import { ChunkSpec } from "@bitstreamy/ppspp-protocol";

export class ChunkStore {
  private data: Buffer[];
  private signatures: Buffer[];
  private offset: number;
  private discardWindow: number;
  private initSegment?: Buffer;
  private initSegmentSignature?: Buffer;

  constructor(discardWindow: number) {
    this.data = [];
    this.signatures = [];
    this.offset = 0;
    this.discardWindow = discardWindow;
  }

  public getChunks(chunkSpec: ChunkSpec): Buffer[] {
    if (chunkSpec.spec instanceof Array) {
      const [from, to] = chunkSpec.spec;

      if (from === 0xffffffff && to === 0xffffffff) {
        return this.initSegment ? [this.initSegment] : [];
      }

      return this.data.slice(from - this.offset, to - this.offset + 1);
    }

    return [];
  }

  public getChunkSignatures(chunkSpec: ChunkSpec): Buffer[] {
    if (chunkSpec.spec instanceof Array) {
      const [from, to] = chunkSpec.spec;

      if (from === 0xffffffff && to === 0xffffffff) {
        return this.initSegmentSignature ? [this.initSegmentSignature] : [];
      }

      return this.signatures.slice(from - this.offset, to - this.offset + 1);
    }

    return [];
  }

  public setChunks(chunkSpec: ChunkSpec, data: Buffer[]) {
    if (chunkSpec.spec instanceof Array) {
      const [from, to] = chunkSpec.spec;

      if (from === 0xffffffff && to === 0xffffffff) {
        this.initSegment = data[0];
      } else {
        for (let i = from; i <= to; i++) {
          this.data[i - this.offset] = data[i - from];
        }
      }
    }
  }

  public setChunkSignatures(chunkSpec: ChunkSpec, data: Buffer[]) {
    if (chunkSpec.spec instanceof Array) {
      const [from, to] = chunkSpec.spec;

      if (from === 0xffffffff && to === 0xffffffff) {
        this.initSegmentSignature = data[0];
      } else {
        for (let i = from; i <= to; i++) {
          this.signatures[i - this.offset] = data[i - from];
        }
      }
    }
  }

  public discardOldChunks() {
    const cleanData = this.data.slice(this.discardWindow * -1);

    this.offset += this.data.length - cleanData.length;

    this.data = cleanData;
  }
}
