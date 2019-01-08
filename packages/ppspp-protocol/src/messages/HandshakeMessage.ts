import { ProtocolOptions } from "../fields/ProtocolOptions";
import { Message } from "./Message";

export class HandshakeMessage extends Message {
  public static CODE = 0x00;

  public sourceChannel: number;
  private protocolOptions: ProtocolOptions;

  constructor(
    sourceChannel: number,
    protocolOptions: ProtocolOptions,
    destinationChannel?: number,
  ) {
    super(destinationChannel || 0);

    this.sourceChannel = sourceChannel;
    this.protocolOptions = protocolOptions;
  }

  public encode() {
    const srcChannelBuf = Buffer.alloc(4);
    srcChannelBuf.writeUInt32BE(this.sourceChannel, 0);

    return super.encode(
      Buffer.concat([
        Buffer.from([HandshakeMessage.CODE]),
        srcChannelBuf,
        this.protocolOptions.encode()
      ])
    );
  }
}
