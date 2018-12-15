import { Message, MessageCode } from "./Message";

export class PexResV6Message extends Message {
  private ip: Buffer;
  private port: number;

  constructor(destinationChannel: number, ip: Buffer, port: number) {
    super(destinationChannel);

    this.ip = ip;
    this.port = port;
  }

  public encode() {
    const portBuf = Buffer.alloc(2);
    portBuf.writeUInt16BE(this.port, 0);

    return super.encode(
      Buffer.concat([Buffer.from([MessageCode.PEX_RESv6, this.ip, portBuf])])
    );
  }
}
