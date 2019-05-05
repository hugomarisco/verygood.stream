export class ChunkStore {
  private data: Buffer[];
  private offset: number;
  private discardWindow: number;
  private initSegment?: Buffer;

  constructor(discardWindow: number) {
    this.data = [];
    this.offset = 0;
    this.discardWindow = discardWindow;
  }

  public getChunk(index: number) {
    if (index === 0xffffffff) {
      return this.initSegment;
    } else {
      return this.data[index - this.offset];
    }
  }

  public setChunk(index: number, data: Buffer) {
    if (index === 0xffffffff) {
      this.initSegment = data;
    } else {
      this.data[index - this.offset] = data;
    }
  }

  public discardOldChunks() {
    const cleanData = this.data.slice(this.discardWindow * -1);

    this.offset += this.data.length - cleanData.length;

    this.data = cleanData;
  }
}
