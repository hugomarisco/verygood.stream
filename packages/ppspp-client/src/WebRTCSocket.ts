import SimplePeer, { Options } from "simple-peer";
import wrtc from "wrtc";

export class WebRTCSocket extends SimplePeer {
  constructor(opts?: Options) {
    if (SimplePeer.WEBRTC_SUPPORT) {
      super(opts);
    } else {
      super({ wrtc, ...opts });
    }
  }
}
