import {
  AckMessage,
  ChokeMessage,
  ChunkAddressingMethod,
  ChunkSpec,
  ContentIntegrityProtectionMethod,
  DataMessage,
  HandshakeMessage,
  HaveMessage,
  LiveSignatureAlgorithm,
  PreciseTimestamp,
  ProtocolOptions,
  RequestMessage,
  SignedIntegrityMessage,
  UnchokeMessage
} from "@bitstreamy/ppspp-protocol";
import forge from "node-forge";
import { Duplex } from "stream";
import { ChunkStore } from "./ChunkStore";
import { RemotePeer } from "./RemotePeer";

jest.mock("stream");
jest.mock("./Logger");

Date.now = jest.fn().mockReturnValue(1000001);

const privateKey = forge.pki.privateKeyFromPem(`-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQC1tjOOArGlzSXVZqSt7vDQ5VAXQ7RPaUamki00809bssHLmnlw
R+/pl2XW3lVBCLFIwjCSL/2nwf+f9IeIDfsbH/u7h3EyDkjjlIPZ7gEccqlMtNcl
HEaYq6/8UiBwlhCvUpFKDU/gyxr54cdcd6FjYGBFle1cYfRMj2YyrTcLNwIDAQAB
AoGBAJ1GBNsuA7oglFVe0LvmajIzt51bMS3mTYsQS+ZfjNkuH8PsgJ0o9kJ0kmVl
694s+tyhjs6IkP/ozioQyFl+2E1M8Eptl8kHBB/0n2AKkdOvJxumD51UVZ4HaNWN
k1vr1xvx/bigU4HkNzNYjbCf99ZmnZxCbJNw2yzkhPrnwaYxAkEA5Cuv3CBRcKwR
hga2jMD4f0YTBpiPkM3SBy1+fOJLLJM5Ad7IRlwGJAapwqAMdAVkvz2cBKRW755p
7drmuKCcuQJBAMvf5g6awCKmnT1/FJO0KeK4r/qVWRBuAqrjL6ifHRkR586lxuxO
sIO349MzkKKULkJghTNIB2vjTmlD/cnmT28CQQCWaP4au+szvRooIdDA5IxrSgRM
utEZAbTMKn9RT9OCZOKViwi26P7bTNEnjV3oNY3+S1zH6pWsi98EfuLNHoNxAkAB
42X/FqHW8FIegrHPGGkW530BxiZYB5zQtl/3oNmlJMxP1qs7/xKVdbuPdjfNua+f
/8LcEbu33RgZ035jQ1XTAkEAzN2kKAAU+l++SrMvbOE1WSdM0vcU9bJOgXvomdq9
ygi3Qta6vUYUq5irqFvdg43nW7jWaSkiDQM8jfY6R76LYQ==
-----END RSA PRIVATE KEY-----`);

const swarmId = Buffer.from(
  "CAMBAAG1tjOOArGlzSXVZqSt7vDQ5VAXQ7RPaUamki00809bssHLmnlwR+/pl2XW3lVBCLFIwjCSL/2nwf+f9IeIDfsbH/u7h3EyDkjjlIPZ7gEccqlMtNclHEaYq6/8UiBwlhCvUpFKDU/gyxr54cdcd6FjYGBFle1cYfRMj2YyrTcLNw==",
  "base64"
);

const signature = Buffer.from(
  "LPrarNY+V+gha6sH/SLaqC++MPPdYIdEi1xa6HP45Y7LHu+Nf6/QzmqLMiWKCm+W9HveIiprAMYAbhZy3RF1tGJSyOUCFkHwlm7DVllrXfSG8LeAc2TBsIozJXP2X7JMgRr5iRfte7yB87ukiPsmTtpkJ1fbV2j7A1wDrZ+a7EQ=",
  "base64"
);

describe("RemotePeer", () => {
  let protocolOptions: ProtocolOptions;
  let chunkStore: ChunkStore;
  let socket: Duplex;
  let remotePeer: RemotePeer;

  beforeEach(() => {
    protocolOptions = new ProtocolOptions(
      1,
      ContentIntegrityProtectionMethod.SIGN_ALL,
      ChunkAddressingMethod["32ChunkRanges"],
      2,
      10,
      [],
      1,
      swarmId,
      LiveSignatureAlgorithm.RSASHA256
    );

    chunkStore = new ChunkStore(10);

    socket = new Duplex();

    remotePeer = new RemotePeer(
      socket,
      protocolOptions,
      chunkStore,
      privateKey
    );
  });

  test("should bubble up socket errors", done => {
    remotePeer.on("error", err => {
      expect(err.message).toBe("socket error");

      done();
    });

    socket.emit("error", new Error("socket error"));
  });

  describe("#handshake()", () => {
    test("should send an HandshakeMessage to the socket", () => {
      remotePeer.handshake(1);

      const expectedEncodedMessage = new HandshakeMessage(
        1,
        protocolOptions,
        remotePeer.peerId
      ).encode();

      expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessage);
    });
  });

  describe("#have()", () => {
    test("should send an HaveMessage to the socket", () => {
      const chunkSpec = new ChunkSpec([1, 1]);

      remotePeer.have(chunkSpec);

      const expectedEncodedMessage = new HaveMessage(
        remotePeer.peerId,
        chunkSpec
      ).encode();

      expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessage);
    });
  });

  describe("#request()", () => {
    test("should send an RequestMessage to the socket", () => {
      const chunkSpec = new ChunkSpec([1, 1]);

      remotePeer.request(chunkSpec);

      const expectedEncodedMessage = new RequestMessage(
        remotePeer.peerId,
        chunkSpec
      ).encode();

      expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessage);
    });
  });

  describe("#handleMessage()", () => {
    describe("Handshake message", () => {
      test("should respond with a valid Handshake message", () => {
        socket.emit(
          "data",
          new HandshakeMessage(1, protocolOptions, remotePeer.peerId).encode()
        );

        const expectedEncodedMessage = new HandshakeMessage(
          1,
          protocolOptions,
          remotePeer.peerId
        ).encode();

        expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessage);
      });
    });

    describe("Have message", () => {
      test("should update chunk availability and request the chunk", () => {
        const chunkSpec = new ChunkSpec([1, 1]);

        socket.emit(
          "data",
          new HaveMessage(remotePeer.peerId, chunkSpec).encode()
        );

        const expectedEncodedMessage = new RequestMessage(
          remotePeer.peerId,
          chunkSpec
        ).encode();

        expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessage);

        expect(remotePeer.availability.get(1)).toBe(true);
      });

      test("should not request chunk if its in the store already", () => {
        const chunkSpec = new ChunkSpec([1, 1]);

        chunkStore.setChunks(chunkSpec, [Buffer.from("abc")]);

        socket.emit(
          "data",
          new HaveMessage(remotePeer.peerId, chunkSpec).encode()
        );

        expect(socket.write).not.toBeCalled();
      });
    });

    describe("Data message", () => {
      test("should verify the integrity, emit the chunk and ACK it", done => {
        const chunkSpec = new ChunkSpec([1, 1]);
        const timestamp = new PreciseTimestamp([1000, 1000]);

        const dataMessage = new DataMessage(
          remotePeer.peerId,
          chunkSpec,
          timestamp,
          Buffer.from("abc")
        );

        remotePeer.on("data", message => {
          expect(message).toEqual(dataMessage);

          done();
        });

        socket.emit(
          "data",
          Buffer.concat([
            new SignedIntegrityMessage(
              remotePeer.peerId,
              chunkSpec,
              timestamp,
              signature
            ).encode(),
            dataMessage.encode()
          ])
        );

        const expectedEncodedMessage = new AckMessage(
          remotePeer.peerId,
          chunkSpec,
          new PreciseTimestamp([0, 0])
        ).encode();

        expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessage);
      });

      test("should emit an error if there isn't a stored signed integrity", done => {
        remotePeer.on("error", error => {
          expect(error).toEqual(
            new Error("Couldn't find the signature for the message")
          );

          done();
        });

        socket.emit(
          "data",
          Buffer.concat([
            new DataMessage(
              remotePeer.peerId,
              new ChunkSpec([1, 1]),
              new PreciseTimestamp([1000, 1000]),
              Buffer.from("abc")
            ).encode()
          ])
        );

        expect(socket.write).not.toHaveBeenCalled();
      });

      test("should emit an error if the signature is not valid", done => {
        const chunkSpec = new ChunkSpec([1, 1]);
        const timestamp = new PreciseTimestamp([1000, 1000]);
        const badSignature = Buffer.from(
          "aB2ly+PtgTw6rOeg8opdasXbwHnuvlX1USqGT3zWRym8AD5/2lulnjMrz3EkdS8XMNvckAkN7PvgtpJD8sQbiKZMnSDL6qGRD4rtwDPCiOD0EtEQnzCktiAzjhF8dTj9hbK+e0vR++s8jJJLcUwsQscrtm/SMvhBZcfd5aOqpQM=",
          "base64"
        );

        remotePeer.on("error", error => {
          expect(error).toEqual(new Error("Invalid signature found"));

          done();
        });

        socket.emit(
          "data",
          Buffer.concat([
            new SignedIntegrityMessage(
              remotePeer.peerId,
              chunkSpec,
              timestamp,
              badSignature
            ).encode(),
            new DataMessage(
              remotePeer.peerId,
              chunkSpec,
              timestamp,
              Buffer.from("abc")
            ).encode()
          ])
        );

        expect(socket.write).not.toHaveBeenCalled();
      });
    });

    describe("Ack message", () => {
      test("should update chunk availability", () => {
        socket.emit(
          "data",
          new AckMessage(
            remotePeer.peerId,
            new ChunkSpec([1, 1]),
            new PreciseTimestamp()
          ).encode()
        );

        expect(remotePeer.availability.get(1)).toBe(true);
      });
    });

    describe("Choke message", () => {
      test("should set choking flag to true", () => {
        socket.emit("data", new ChokeMessage(remotePeer.peerId).encode());

        expect(remotePeer.isChoking).toBe(true);
      });
    });

    describe("Unchoke message", () => {
      test("should set choking flag to false", () => {
        socket.emit("data", new UnchokeMessage(remotePeer.peerId).encode());

        expect(remotePeer.isChoking).toBe(false);
      });
    });

    describe("Request message", () => {
      test("should send a data message containing the chunk if available", () => {
        const chunkSpec = new ChunkSpec([1, 1]);
        const timestamp = new PreciseTimestamp([1000, 1000]);
        const data = Buffer.from("abc");

        chunkStore.setChunks(chunkSpec, [data]);

        socket.emit(
          "data",
          new RequestMessage(remotePeer.peerId, chunkSpec).encode()
        );

        const expectedEncodedMessages = Buffer.concat([
          new SignedIntegrityMessage(
            remotePeer.peerId,
            chunkSpec,
            timestamp,
            signature
          ).encode(),
          new DataMessage(
            remotePeer.peerId,
            chunkSpec,
            timestamp,
            data
          ).encode()
        ]);

        expect(socket.write).toHaveBeenCalledWith(expectedEncodedMessages);
      });
    });
  });
});
