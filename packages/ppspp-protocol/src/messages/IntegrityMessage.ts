import { ChunkSpec } from "../fields/ChunkSpec";
import { Message } from "./Message";

export class IntegrityMessage extends Message {
  public static CODE = 0x04;

  public chunkSpec: ChunkSpec;
  public hash: Buffer;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
    hash: Buffer,
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
    this.hash = hash;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([IntegrityMessage.CODE]),
        this.chunkSpec.encode(),
        this.hash,
      ])
    );
  }
}
