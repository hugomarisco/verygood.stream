import { ChunkSpec } from "../fields/ChunkSpec";
import { Message } from "./Message";

export class RequestMessage extends Message {
  public static CODE = 0x08;

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
        Buffer.from([RequestMessage.CODE]),
        this.chunkSpec.encode(),
      ])
    );
  }
}
