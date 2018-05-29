const assert = require("assert");
const { CHUNK_ADDR_METHODS, MERKLE_HASH_FUNCS, SIG_ALGOS } = require("../lib/constants");

const Protocol = require("../index");

describe("Protocol", function() {
  beforeEach(() => {
    this.protocol = new Protocol();

    this.protocol.pipe(this.protocol);
  });

  describe("HANDSHAKE", () => {
    it("should accept an empty destChannel", cb => {
      const msg = { srcChannel: 1, protocolOptions: {} };

      this.protocol.on("handshake", res => {
        assert.deepStrictEqual(res, { ...msg, destChannel: 0 });

        cb();
      });

      this.protocol.handshake(msg);
    });

    it("should transform the protocol options", cb => {
      const msg = {
        destChannel: 2,
        srcChannel: 1,
        protocolOptions: {
          version: 1,
          minVersion: 1,
          swarmId: "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxT1zqS05pCxDJ1oA2sjlTYAl6bsjlH3hwwbAuiy2K9NYkAOQzRQeLxIEUpC+MoZ8heEIzEwrwmH7RJIbY4EtC2Ops73Cg3dMZhyYwoP2xL7XLbsHebw0CZUzXB54rIJcaB+N5EhoGDzFU4ck7VZLMfdAUTvyAyB+dY+3bZtBvDCNueBLMP+At+0chR4pjNpABHTIbVFtvueA05n0A/kJf8OZ8FKW/2fBw04p0t5KcilYV7PMs8ubP49Gr0+k0MI9GyCYOkXZVI5JEdCCvjo1pBQaAfH1APKxycnKWAcpFr0TKp/4BnO6gULBRIS1iJxc38LEHtuDVfpQmmqM/rCcm8TnN3965O7mrUmM/PSUh+Ijb4z7ibm0/3d7fi0+de9MsujpvLlfz/DByQ9JGMqZWAosw2cSJSvs8ee22JvozJcYKAl6b/Q9HD8696Uaagv3QY5lQUfVDec5BThVUXmdeHRXd6INZRH+ucLYr49Upfb1MIm3hEqhXTLfrOKcRrVISWp1LJ/z/qFAaVNTeMJUu2AorrveE1UsP/0UKq0yVCGWkiN9YMlA4t/L8F4ZZN4x7nZjsKmwH0Nnkh2lcyf9AwXhGEaNktELlLxxBc/YAl3yNT/amxTIbOUu9tUnfRfCT5niumniQ2IZfKudGsvDRcmpEmq68zmQRpjEX9D7MckCAwEAAQ==",
          integrityProtectionMethod: 1,
          merkleFunc: 2,
          liveSigAlgo: 8,
          chunkAddrMethod: 2,
          liveDiscardWindow: 1000,
          chunkSize: 2000
        }
      };

      this.protocol.on("handshake", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake(msg);
    });
  });

  describe("HAVE", () => {
    it("should transform bins as chunk spec", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1]
      }

      this.protocol.on("have", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          chunkAddrMethod: CHUNK_ADDR_METHODS["32BINs"]
        }
      });

      this.protocol.have(msg);
    });

    it("should transform ranges as chunk spec", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2]
      }

      this.protocol.on("have", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.have(msg);
    });
  });

  describe("DATA", () => {
    it("should transform data messages", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2],
        timestamp: [1000, 2000],
        data: Buffer.from([1, 2, 3, 4, 5])
      };

      this.protocol.on("chunk", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          chunkSize: 5,
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.chunk(msg);
    });
  });

  describe("ACK", () => {
    it("should transform ack messages", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2],
        delay: [1000, 2000]
      };

      this.protocol.on("ack", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.ack(msg);
    });
  });

  describe("INTEGRITY", () => {
    it("should transform integrity messages", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2],
        hash: "768412320f7b0aa5812fce428dc4706b3cae50e02a64caa16a782249bfe8efc4b7ef1ccb126255d196047dfedf17a0a9"
      };

      this.protocol.on("integrity", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          merkleFunc: MERKLE_HASH_FUNCS.SHA384,
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.integrity(msg);
    });
  });

  describe("SIGNED_INTEGRITY", () => {
    it("should transform signed integrity messages", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2],
        timestamp: [1000, 2000],
        signature: "h/BY+zpm8jPTw7wgWEhCHgeZoehpILj2irUwbEYpP4J9i39JRjzanqBKNtBqLA26Ggcut+lA6sTI57N0wtTb2aSrlRfZLelpeOR1FHUS9yaiud9fuHTl6AYqH3XjJvAgrGxN8ElCH1iRfKnXWgtRgpqdoCAszvwhuGlIw8BkG08VvT4+Z26E8eSg4ltdJ6maEclBNF8XF5xeH7M/HEjkyHAE7CnjEHv7YjpPuCYH8itP2Dad9csAnVy1sZd7ujG2QtZPNEn+UrXQicbYIVLX+EjnfZi+F+lcaQ63E7baIBEbHqxXt5hS/ZsH8c7Uq0pCwNZ7niV8ezaZ2ks6EFqOtZqaxrRYxADA8cgiDYuFWOQIp15JZ5zmI8Na3nrqwOGjTFYSvQ+zUbWNYn7vEQlpMFrwt8iKRkJ3mCE9kLU1CKAiZAtKAyXwog+WStjGHL/DLsvCYKHbQ6neN/UavLuKl422fFft3AnEDrXNjhoDRzb+MfwbdkV7WAllPpq/fbOhCdhsEvovRsax99IgMOs+WNbzrVp45YsUWoYn/qvVADp0yY2OyNmzHzRkpabP/bOxELr16cXU1vVBqqqEYKi3bNWaPHQHt7WlEC/Vg/x/bQPF/zQBo5oukshVA/dNv6n03uaKPYZylMYqc9cdAkXrcXL7pgJKBjuihTJW0sJihds="
      };

      this.protocol.on("signedIntegrity", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          swarmId: "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxT1zqS05pCxDJ1oA2sjlTYAl6bsjlH3hwwbAuiy2K9NYkAOQzRQeLxIEUpC+MoZ8heEIzEwrwmH7RJIbY4EtC2Ops73Cg3dMZhyYwoP2xL7XLbsHebw0CZUzXB54rIJcaB+N5EhoGDzFU4ck7VZLMfdAUTvyAyB+dY+3bZtBvDCNueBLMP+At+0chR4pjNpABHTIbVFtvueA05n0A/kJf8OZ8FKW/2fBw04p0t5KcilYV7PMs8ubP49Gr0+k0MI9GyCYOkXZVI5JEdCCvjo1pBQaAfH1APKxycnKWAcpFr0TKp/4BnO6gULBRIS1iJxc38LEHtuDVfpQmmqM/rCcm8TnN3965O7mrUmM/PSUh+Ijb4z7ibm0/3d7fi0+de9MsujpvLlfz/DByQ9JGMqZWAosw2cSJSvs8ee22JvozJcYKAl6b/Q9HD8696Uaagv3QY5lQUfVDec5BThVUXmdeHRXd6INZRH+ucLYr49Upfb1MIm3hEqhXTLfrOKcRrVISWp1LJ/z/qFAaVNTeMJUu2AorrveE1UsP/0UKq0yVCGWkiN9YMlA4t/L8F4ZZN4x7nZjsKmwH0Nnkh2lcyf9AwXhGEaNktELlLxxBc/YAl3yNT/amxTIbOUu9tUnfRfCT5niumniQ2IZfKudGsvDRcmpEmq68zmQRpjEX9D7MckCAwEAAQ==",
          liveSigAlgo: SIG_ALGOS.RSASHA256,
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.signedIntegrity(msg);
    });
  });

  describe("REQUEST", () => {
    it("should transform request messages", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2]
      };

      this.protocol.on("request", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.request(msg);
    });
  });

  describe("CANCEL", () => {
    it("should transform cancel messages", cb => {
      const msg = {
        destChannel: 1,
        chunkSpec: [1, 2]
      };

      this.protocol.on("cancel", res => {
        assert.deepStrictEqual(res, msg);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {
          chunkAddrMethod: CHUNK_ADDR_METHODS["32ChunkRanges"]
        }
      });

      this.protocol.cancel(msg);
    });
  });

  describe("CHOKE", () => {
    it("should transform choke messages", cb => {
      this.protocol.on("choke", ({ destChannel }) => {
        assert.equal(destChannel, 1);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {}
      });

      this.protocol.choke();
    });
  });

  describe("UNCHOKE", () => {
    it("should transform unchoke messages", cb => {
      this.protocol.on("unchoke", ({ destChannel }) => {
        assert.equal(destChannel, 1);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {}
      });

      this.protocol.unchoke();
    });
  });

  describe("KEEPALIVE", () => {
    it("should transform keepalive messages", cb => {
      this.protocol.on("keepalive", ({ destChannel }) => {
        assert.equal(destChannel, 1);

        cb();
      });

      this.protocol.handshake({
        destChannel: 1,
        srcChannel: 1,
        protocolOptions: {}
      });

      this.protocol.keepalive();
    });
  });
});
