import { Message, MessageCode } from "./Message";
import { ProtocolOptions } from "./ProtocolOptions";

export class HandshakeMessage extends Message {
  public sourceChannel: number;
  private protocolOptions: ProtocolOptions;

  constructor(
    destinationChannel: number = 0,
    sourceChannel: number,
    protocolOptions: ProtocolOptions
  ) {
    super(destinationChannel);

    this.sourceChannel = sourceChannel;
    this.protocolOptions = protocolOptions;
  }

  public encode() {
    const srcChannelBuf = Buffer.alloc(4);
    srcChannelBuf.writeUInt32BE(this.sourceChannel, 0);

    return super.encode(
      Buffer.concat([
        Buffer.from([MessageCode.HANDSHAKE]),
        srcChannelBuf,
        this.protocolOptions.encode()
      ])
    );
  }
}
