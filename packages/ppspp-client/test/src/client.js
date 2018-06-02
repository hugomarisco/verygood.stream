const assert = require("assert");
const sinon = require("sinon");
const MemoryChunkStore = require("memory-chunk-store");

const Client = require("../../");

describe("Client", function() {
  beforeEach(() => {
    this.tracker = {
      getPeers: sinon.stub().resolves([])
    };

    this.client = new Client({
      trackers: [this.tracker],
      ChunkStore: MemoryChunkStore
    });
  });

  describe("addSwarm()", () => {
    it("should request peers from trackers", () => {
      const swarmId = "abc";

      this.client.addSwarm(swarmId, { chunkSize: 1000 });

      assert(this.tracker.getPeers.withArgs(swarmId).calledOnce);
    });
  });
});
