import { Decoder } from "./Decoder";
import { ChunkSpec } from "./fields/ChunkSpec";
import { PreciseTimestamp } from "./fields/PreciseTimestamp";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  ProtocolOptions
} from "./fields/ProtocolOptions";
import { AckMessage } from "./messages/AckMessage";
import { CancelMessage } from "./messages/CancelMessage";
import { ChokeMessage } from "./messages/ChokeMessage";
import { DataMessage } from "./messages/DataMessage";
import { HandshakeMessage } from "./messages/HandshakeMessage";
import { HaveMessage } from "./messages/HaveMessage";
import { KeepAliveMessage } from "./messages/KeepAliveMessage";
import { PexReqMessage } from "./messages/PexReqMessage";
import { PexResCertMessage } from "./messages/PexResCertMessage";
import { PexResV4Message } from "./messages/PexResV4Message";
import { PexResV6Message } from "./messages/PexResV6Message";
import { RequestMessage } from "./messages/RequestMessage";
import { UnchokeMessage } from "./messages/UnchokeMessage";

describe("Decoder", () => {
  let protocolOptions: ProtocolOptions;

  beforeAll(() => {
    protocolOptions = new ProtocolOptions(
      1,
      ContentIntegrityProtectionMethod.NONE,
      ChunkAddressingMethod["32ChunkRanges"],
      2,
      3,
      [],
      1,
      Buffer.from([0x0a, 0x0b])
    );
  });
  
  test("should decode Handshake messages", () => {
    const handshakeMessage = new HandshakeMessage(1, protocolOptions, 3);

    const [decodedMessage] = Decoder.decode(handshakeMessage.encode());

    expect(decodedMessage).toEqual(handshakeMessage);
  });

  describe("Ack messages", () => {
    test("should throw if protocol options are not provided", () => {
      const ackMessage = new AckMessage(
        1,
        new ChunkSpec([2, 3]),
        new PreciseTimestamp([4, 5])
      );

      expect(() => Decoder.decode(ackMessage.encode())).toThrowError();
    });

    test("should decode Ack messages", () => {
      const ackMessage = new AckMessage(
        1,
        new ChunkSpec([2, 3]),
        new PreciseTimestamp([4, 5])
      );

      const [decodedMessage] = Decoder.decode(
        ackMessage.encode(),
        protocolOptions
      );

      expect(decodedMessage).toEqual(ackMessage);
    });
  });

  describe("Cancel messages", () => {
    test("should throw if protocol options are not provided", () => {
      const cancelMessage = new CancelMessage(1, new ChunkSpec([2, 3]));

      expect(() => Decoder.decode(cancelMessage.encode())).toThrowError();
    });

    test("should decode Cancel messages", () => {
      const cancelMessage = new CancelMessage(1, new ChunkSpec([2, 3]));

      const [decodedMessage] = Decoder.decode(
        cancelMessage.encode(),
        protocolOptions
      );

      expect(decodedMessage).toEqual(cancelMessage);
    });
  });

  test("should decode Choke messages", () => {
    const chokeMessage = new ChokeMessage(1);

    const [decodedMessage] = Decoder.decode(
      chokeMessage.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(chokeMessage);
  });

  describe("Data messages", () => {
    test("should throw if protocol options are not provided", () => {
      const dataMessage = new DataMessage(
        1,
        new ChunkSpec([2, 3]),
        new PreciseTimestamp([1, 2]),
        Buffer.from([0x0a, 0x0b])
      );

      expect(() => Decoder.decode(dataMessage.encode())).toThrowError();
    });

    test("should decode Data messages", () => {
      const dataMessage = new DataMessage(
        1,
        new ChunkSpec([2, 3]),
        new PreciseTimestamp([1, 2]),
        Buffer.from([0x0a, 0x0b])
      );

      const [decodedMessage] = Decoder.decode(
        dataMessage.encode(),
        protocolOptions
      );

      expect(decodedMessage).toEqual(dataMessage);
    });
  });

  describe("Have messages", () => {
    test("should throw if protocol options are not provided", () => {
      const haveMessage = new HaveMessage(1, new ChunkSpec([2, 3]));

      expect(() => Decoder.decode(haveMessage.encode())).toThrowError();
    });

    test("should decode Have messages", () => {
      const haveMessage = new HaveMessage(1, new ChunkSpec([2, 3]));

      const [decodedMessage] = Decoder.decode(
        haveMessage.encode(),
        protocolOptions
      );

      expect(decodedMessage).toEqual(haveMessage);
    });
  });

  test("should decode KeepAlive messages", () => {
    const keepAliveMessage = new KeepAliveMessage(1);

    const [decodedMessage] = Decoder.decode(
      keepAliveMessage.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(keepAliveMessage);
  });

  test("should decode PexReq messages", () => {
    const pexReqMessage = new PexReqMessage(1);

    const [decodedMessage] = Decoder.decode(
      pexReqMessage.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(pexReqMessage);
  });

  test("should decode PexResV4 messages", () => {
    const pexResV4Message = new PexResV4Message(1, 2, 3);

    const [decodedMessage] = Decoder.decode(
      pexResV4Message.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(pexResV4Message);
  });

  test("should decode PexResV6 messages", () => {
    const pexResV6Message = new PexResV6Message(
      1,
      Buffer.from("ffffffffffffffffffffffffffffffff", "hex"),
      2
    );

    const [decodedMessage] = Decoder.decode(
      pexResV6Message.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(pexResV6Message);
  });

  test("should decode PexResCert messages", () => {
    const pexResCertMessage = new PexResCertMessage(1, Buffer.from("abcd"));

    const [decodedMessage] = Decoder.decode(
      pexResCertMessage.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(pexResCertMessage);
  });

  describe("Request messages", () => {
    test("should throw if protocol options are not provided", () => {
      const requestMessage = new RequestMessage(1, new ChunkSpec([2, 3]));

      expect(() => Decoder.decode(requestMessage.encode())).toThrowError();
    });

    test("should decode Request messages", () => {
      const requestMessage = new RequestMessage(1, new ChunkSpec([2, 3]));

      const [decodedMessage] = Decoder.decode(
        requestMessage.encode(),
        protocolOptions
      );

      expect(decodedMessage).toEqual(requestMessage);
    });
  });

  test("should decode Unchoke messages", () => {
    const unchokeMessage = new UnchokeMessage(1);

    const [decodedMessage] = Decoder.decode(
      unchokeMessage.encode(),
      protocolOptions
    );

    expect(decodedMessage).toEqual(unchokeMessage);
  });
});
