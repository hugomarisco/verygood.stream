import { Logger } from "./Logger";
import { Peer } from "./Peer";

export class Swarm {
  private swarmId: string;
  private peers: { [peerId: string]: Peer };

  constructor(swarmId: string) {
    this.swarmId = swarmId;

    this.peers = {};
  }

  public addPeer(peer: Peer) {
    this.peers[peer.peerId] = peer;

    peer.on("error", this.onPeerError.bind(this, peer));
    peer.on("close", this.onPeerClose.bind(this, peer));
    peer.on("answer", this.onPeerAnswer.bind(this, peer));
    peer.on("find", this.onPeerFind.bind(this, peer));
  }

  private onPeerError(peer: Peer, error: Error) {
    delete this.peers[peer.peerId];

    Logger.error(error.message, { peerId: peer.peerId });
  }

  private onPeerClose(peer: Peer) {
    delete this.peers[peer.peerId];

    Logger.debug("Peer closed connection", {
      peerId: peer.peerId
    });
  }

  private onPeerAnswer(peer: Peer, originPeerId: string, answer: string) {
    const originPeer = this.peers[originPeerId];

    if (!originPeer) {
      Logger.warn("Answer received to unknown peer", {
        originPeerId,
        peerId: peer.peerId
      });

      return;
    }

    Logger.debug("Answer sent", {
      originPeerId,
      peerId: peer.peerId
    });

    originPeer.sendAnswer(answer);
  }

  private onPeerFind(peer: Peer) {
    Object.keys(this.peers).forEach(availablePeerId => {
      const availablePeer = this.peers[availablePeerId];

      const offer = availablePeer.getOffer();

      if (offer) {
        peer.sendPeer({ peerId: availablePeerId, offer });
      }
    });
  }
}
