import SimplePeer, { Options } from "simple-peer";
import wrtc from "wrtc";

export class WebRTCSocket extends SimplePeer {
  constructor(opts?: Options) {
    super({ wrtc, ...opts });
  }
}
