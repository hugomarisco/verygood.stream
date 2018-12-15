import React from "react";
import PPSPPClient from "@verygood.stream/ppspp-client";
import PageWrapper from "./PageWrapper";
import StreamDetails from "./StreamDetails";
import Player from "./Player";

class Stream extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.client = new PPSPPClient();
  }

  render() {
    const { match } = this.props;

    return (
      <PageWrapper>
        <Player src="/video.mp4" controls />

        <StreamDetails />
      </PageWrapper>
    );
  }
}

export default Stream;
