export class PreciseTimestamp {
  public seconds: number;
  public microseconds: number;

  constructor(timestamp?: [number, number]) {
    const millisecondsTimestamp = Date.now();

    this.seconds = timestamp
      ? timestamp[0]
      : Math.floor(millisecondsTimestamp / 1000);
    this.microseconds = timestamp
      ? timestamp[1]
      : (millisecondsTimestamp % 1000) * 1000;
  }

  public encode() {
    const timestampBuf = Buffer.alloc(8);

    timestampBuf.writeUInt32BE(this.seconds, 0);
    timestampBuf.writeUInt32BE(this.microseconds, 4);

    return timestampBuf;
  }

  public minus(timestamp: PreciseTimestamp) {
    const secondsDiff = this.seconds - timestamp.seconds;
    const microsecondsDifference = this.microseconds - timestamp.microseconds;

    return new PreciseTimestamp([
      microsecondsDifference < 0 ? secondsDiff - 1 : secondsDiff,
      microsecondsDifference < 0
        ? 10000 + microsecondsDifference
        : microsecondsDifference
    ]);
  }
}
