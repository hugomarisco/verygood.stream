import React from "react";
import styled from "styled-components";
import StreamDetails from "./StreamDetails";
import Player from "./Player";

const PageWrapper = styled.div`
  max-width: 80%;
  margin: 2em auto;
`;

export default ({ match }) => (
  <PageWrapper>
    <Player src="/video.mp4" controls />

    <StreamDetails />
  </PageWrapper>
);
