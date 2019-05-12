import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  HandshakeMessage,
  LiveSignatureAlgorithm,
  ProtocolOptions
} from "@bitstreamy/ppspp-protocol";
import { ChunkStore } from "./ChunkStore";
import { RemotePeer } from "./RemotePeer";
import { WebRTCSocket } from "./WebRTCSocket";

jest.mock("simple-peer");
jest.mock("./Logger");

describe("RemotePeer", () => {
  let protocolOptions: ProtocolOptions;
  let chunkStore: ChunkStore;
  let socket: WebRTCSocket;
  let remotePeer: RemotePeer;

  beforeEach(() => {
    protocolOptions = new ProtocolOptions(
      1,
      ContentIntegrityProtectionMethod.SIGN_ALL,
      ChunkAddressingMethod["32ChunkRanges"],
      2,
      0xffffffff,
      [],
      1,
      Buffer.from([0x0a, 0x0b]),
      LiveSignatureAlgorithm.RSASHA256
    );

    chunkStore = new ChunkStore(10);

    socket = new WebRTCSocket();

    remotePeer = new RemotePeer(socket, protocolOptions, chunkStore);
  });

  test("should not be choking by default", () => {
    expect(remotePeer.isChoking).toBe(false);
  });

  describe("#handshake()", () => {
    test("should send an HandshakeMessage to the socket", () => {
      remotePeer.handshake(1);

      const expectedEncodedMessage = new HandshakeMessage(
        1,
        protocolOptions,
        remotePeer.peerId
      ).encode();

      expect(socket.send).toHaveBeenCalledWith(expectedEncodedMessage);
    });
  });
});
