export class PreciseTimestamp {
  public seconds: number;
  public microseconds: number;

  constructor(seconds: number, microseconds: number) {
    this.seconds = seconds;
    this.microseconds = microseconds;
  }

  public encode() {
    const timestampBuf = Buffer.alloc(8);

    timestampBuf.writeUInt32BE(this.seconds, 0);
    timestampBuf.writeUInt32BE(this.microseconds, 4);

    return timestampBuf;
  }
}
