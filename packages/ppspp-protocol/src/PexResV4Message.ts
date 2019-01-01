import { Message, MessageCode } from "./Message";

export class PexResV4Message extends Message {
  public ip: number;
  public port: number;

  constructor(destinationChannel: number, ip: number, port: number) {
    super(destinationChannel);

    this.ip = ip;
    this.port = port;
  }

  public encode() {
    const ipBuf = Buffer.alloc(2);
    ipBuf.writeUInt32BE(this.ip, 0);

    const portBuf = Buffer.alloc(2);
    portBuf.writeUInt16BE(this.port, 0);

    return super.encode(
      Buffer.concat([Buffer.from([MessageCode.PEX_RESv4, ipBuf, portBuf])])
    );
  }
}
