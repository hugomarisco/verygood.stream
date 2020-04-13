import { LiveSignatureAlgorithm } from "@bitstreamy/commons";

export class SwarmId {
  public components: { n: Buffer; e: Buffer };
  public data: Buffer;

  constructor(swarmIdBuffer: Buffer) {
    this.data = swarmIdBuffer;

    let index = 0;

    const liveSignatureAlgorithm = swarmIdBuffer.readUInt8(0);
    index += 1;

    switch (liveSignatureAlgorithm) {
      case LiveSignatureAlgorithm.RSASHA1:
      case LiveSignatureAlgorithm.RSASHA256:
      default:
        let exponentLength = swarmIdBuffer.readInt8(index);

        index += 1;

        if (exponentLength === 0) {
          exponentLength = swarmIdBuffer.readUInt16BE(index);
          index += 2;
        }

        const e = swarmIdBuffer.slice(index, index + exponentLength);
        index += exponentLength;

        const n = swarmIdBuffer.slice(index);

        this.components = { e, n };
    }
  }
}
