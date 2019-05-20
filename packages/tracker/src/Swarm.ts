import { Logger } from "./Logger";
import { Peer } from "./Peer";

export class Swarm {
  public swarmId: string;
  public peers: { [peerId: string]: Peer };

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

    Logger.error("Peer error", {
      error,
      peerId: peer.peerId,
      swarmId: this.swarmId
    });
  }

  private onPeerClose(peer: Peer) {
    delete this.peers[peer.peerId];

    Logger.debug("Peer closed connection", {
      peerId: peer.peerId,
      swarmId: this.swarmId
    });
  }

  private onPeerAnswer(
    peer: Peer,
    originPeerId: string,
    socketId: string,
    signalData: string
  ) {
    const originPeer = this.peers[originPeerId];

    if (!originPeer) {
      Logger.warn("Answer received to unknown peer", {
        originPeerId,
        peerId: peer.peerId,
        swarmId: this.swarmId
      });

      return;
    }

    Logger.debug("Answer sent", {
      originPeerId,
      peerId: peer.peerId,
      swarmId: this.swarmId
    });

    originPeer.sendAnswer(peer.peerId, socketId, signalData);
  }

  private onPeerFind(peer: Peer) {
    Object.keys(this.peers)
      .filter(peerId => peerId !== peer.peerId)
      .forEach(peerId => {
        const offer = this.peers[peerId].getOffer();

        if (offer) {
          peer.sendOffer(peerId, offer);

          Logger.debug("Offer sent to Peer", {
            peerId,
            swarmId: this.swarmId
          });
        }
      });
  }
}
