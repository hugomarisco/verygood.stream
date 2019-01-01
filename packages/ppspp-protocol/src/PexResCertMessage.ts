import { Message, MessageCode } from "./Message";

export class PexResCertMessage extends Message {
  public certificate: Buffer;

  constructor(destinationChannel: number, certificate: Buffer) {
    super(destinationChannel);

    this.certificate = certificate;
  }

  public encode() {
    const certLengthBuf = Buffer.alloc(2);

    certLengthBuf.writeUInt16BE(this.certificate.length, 0);

    return super.encode(
      Buffer.concat([
        Buffer.from([MessageCode.PEX_REScert, certLengthBuf, this.certificate])
      ])
    );
  }
}
