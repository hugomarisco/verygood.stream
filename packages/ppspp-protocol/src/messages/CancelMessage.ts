import { ChunkSpec } from "../fields/ChunkSpec";
import { Message } from "./Message";

export class CancelMessage extends Message {
  public static CODE = 0x09;

  public chunkSpec: ChunkSpec;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([CancelMessage.CODE]),
        this.chunkSpec.encode(),
      ])
    );
  }
}
