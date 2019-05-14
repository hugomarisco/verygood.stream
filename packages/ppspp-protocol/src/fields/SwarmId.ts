import {
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm
} from "./ProtocolOptions";

export class SwarmId {
  public exponent?: Buffer;
  public modulus?: Buffer;
  public data: Buffer;

  constructor(
    swarmIdBuffer: Buffer,
    integrityProtectionMethod: number,
    liveSignatureAlgorithm?: number
  ) {
    this.data = swarmIdBuffer;

    switch (integrityProtectionMethod) {
      case ContentIntegrityProtectionMethod.SIGN_ALL:
        switch (liveSignatureAlgorithm) {
          case LiveSignatureAlgorithm.RSASHA1:
          case LiveSignatureAlgorithm.RSASHA256:
            let index = 1;
            let exponentLength = swarmIdBuffer.readInt8(index);

            index += 1;

            if (exponentLength === 0) {
              exponentLength = swarmIdBuffer.readUInt16BE(index);
              index += 2;
            }

            this.exponent = swarmIdBuffer.slice(index, index + exponentLength);
            index += exponentLength;

            this.modulus = swarmIdBuffer.slice(index);
        }
    }
  }
}
