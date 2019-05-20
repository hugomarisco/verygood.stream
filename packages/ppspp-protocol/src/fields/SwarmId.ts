import { LiveSignatureAlgorithm } from "./ProtocolOptions";

export class SwarmId {
  public jwk: { n: string; e: string };
  public data: Buffer;

  constructor(swarmIdBuffer: Buffer, liveSignatureAlgorithm?: number) {
    this.data = swarmIdBuffer;

    switch (liveSignatureAlgorithm) {
      case LiveSignatureAlgorithm.RSASHA1:
      case LiveSignatureAlgorithm.RSASHA256:
      default:
        let index = 1;
        let exponentLength = swarmIdBuffer.readInt8(index);

        index += 1;

        if (exponentLength === 0) {
          exponentLength = swarmIdBuffer.readUInt16BE(index);
          index += 2;
        }

        const e = swarmIdBuffer.slice(index, index + exponentLength);
        index += exponentLength;

        const n = swarmIdBuffer.slice(index);

        this.jwk = { e: e.toString("base64"), n: n.toString("base64") };
    }
  }
}
