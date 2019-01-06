import { ChunkSpec } from "../fields/ChunkSpec";
import { PreciseTimestamp } from "../fields/PreciseTimestamp";
import { Message } from "./Message";

export class DataMessage extends Message {
  public static CODE = 0x01;

  public chunkSpec: ChunkSpec;
  public timestamp: PreciseTimestamp;
  public data: Buffer;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
    timestamp: PreciseTimestamp,
    data: Buffer
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
    this.timestamp = timestamp;
    this.data = data;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([DataMessage.CODE]),
        this.chunkSpec.encode(),
        this.timestamp.encode(),
        this.data
      ])
    );
  }
}
