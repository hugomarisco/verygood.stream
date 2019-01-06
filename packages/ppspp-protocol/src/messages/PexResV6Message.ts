import { Message } from "./Message";

export class PexResV6Message extends Message {
  public static CODE = 0x0c;

  public ip: Buffer;
  public port: number;

  constructor(destinationChannel: number, ip: Buffer, port: number) {
    super(destinationChannel);

    this.ip = ip;
    this.port = port;
  }

  public encode() {
    const portBuf = Buffer.alloc(2);
    portBuf.writeUInt16BE(this.port, 0);

    return super.encode(
      Buffer.concat([Buffer.from([PexResV6Message.CODE]), this.ip, portBuf])
    );
  }
}
