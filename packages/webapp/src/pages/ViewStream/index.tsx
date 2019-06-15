import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import React, { Component } from "react";
import { Badge } from "../../components/Badge";
import { Column } from "../../components/Column";
import { Container } from "../../components/Container";
import {
  EyeIcon,
  SoccerBallIcon,
  UploadDownloadIcon
} from "../../components/Icon";
import { Input } from "../../components/Input";
import { P } from "../../components/P";
import { Row } from "../../components/Row";
import { TopNav } from "../../components/TopNav";
import {
  BroadcastInformationSection,
  CategoryIconContainer,
  StreamDetails,
  StreamTitle,
  VideoPlayer
} from "./styles";

const featuredPlayerSwarmMetadata = new SwarmMetadata(
  Buffer.from("aaa"),
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

export class ViewStream extends Component {
  public render() {
    return (
      <div>
        <TopNav />

        <VideoPlayer
          trackerUrl="wss://tracker.bitstreamy.com"
          liveDiscardWindow={10}
          swarmMetadata={featuredPlayerSwarmMetadata}
          poster="https://images.wallpaperscraft.com/image/football_game_field_tribune_gate_spectators_11418_1920x1080.jpg"
        />
        <BroadcastInformationSection>
          <Container>
            <Row>
              <Column />
              <Column span={2}>
                <CategoryIconContainer>
                  <SoccerBallIcon width="30px" height="30px" />
                </CategoryIconContainer>
              </Column>
              <Column span={8}>
                <StreamTitle>
                  <P dark>Juventus - Roma</P>
                  <P dark translucent>
                    Soccer
                  </P>
                </StreamTitle>
              </Column>
            </Row>

            <Row>
              <Column />
              <Column span={10}>
                <StreamDetails>
                  <EyeIcon color="dark" translucent />
                  <P dark>2.9K</P>
                  <UploadDownloadIcon color="dark" translucent />
                  <P dark>3.1Mb/s</P>
                  <Badge>
                    <P dark>1080p</P>
                  </Badge>
                </StreamDetails>
              </Column>
            </Row>

            <Row>
              <Column />
              <Column span={10}>
                <Input />
              </Column>
            </Row>
          </Container>
        </BroadcastInformationSection>
      </div>
    );
  }
}
