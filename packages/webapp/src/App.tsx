import { PPSPPClient, SwarmMetadata } from "@verygood.stream/ppspp-client";
import React, { Component } from "react";

class App extends Component {
  public componentDidMount() {
    const mediaSource = new MediaSource();

    mediaSource.addEventListener("sourceended", () => {
      console.log("sourceended: " + mediaSource.readyState);
    });
    mediaSource.addEventListener("sourceclose", () => {
      console.log("sourceclose: " + mediaSource.readyState);
    });
    mediaSource.addEventListener("error", () => {
      console.log("error: " + mediaSource.readyState);
    });

    const video = document.querySelector("video");

    video!.src = URL.createObjectURL(mediaSource);

    let sourceBuffer;
    const bufferSize = 5 * 1024 * 1024;
    let bufferIndex = 0;
    const fragMp4Buffer = new Uint8Array(bufferSize);
    let hasInitSegment = false;

    const mimeCodec = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';

    console.log(MediaSource.isTypeSupported(mimeCodec));

    mediaSource.addEventListener("sourceopen", () => {
      console.log("sourceopen: " + mediaSource.readyState);

      sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

      sourceBuffer.mode = "sequence";

      sourceBuffer.addEventListener("updateend", () => {
        // video!.play();

        if (video!.duration && !video!.currentTime) {
          // video!.currentTime = video!.duration;
        }
      });

      const swarmMetadata = new SwarmMetadata(
        Buffer.from("abc", "utf8"),
        0xffffffff,
        2,
        0
      );

      const client = new PPSPPClient(
        swarmMetadata,
        { liveDiscardWindow: 100 },
        "ws://localhost:8080"
      );

      client.on("peer", () => {
        if (!hasInitSegment) {
          client.requestChunk(0xffffffff);
        }
      });

      client.on("chunk", (chunkIndex, data) => {
        if (chunkIndex === 0xffffffff) {
          hasInitSegment = true;
        }

        if (data.length) {
          if (bufferIndex + data.length <= bufferSize) {
            fragMp4Buffer.set(data, bufferIndex);
            bufferIndex = bufferIndex + data.length;
            if (
              hasInitSegment &&
              !sourceBuffer.updating &&
              mediaSource.readyState === "open"
            ) {
              sourceBuffer.appendBuffer(fragMp4Buffer.slice(0, bufferIndex));
              fragMp4Buffer.fill(0);
              bufferIndex = 0;
            }
          }
        }
      });

      client.on("error", console.error);
    });
  }

  public render() {
    return (
      <div>
        <video controls />
      </div>
    );
  }
}

export default App;
