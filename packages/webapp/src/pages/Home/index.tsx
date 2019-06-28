import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  SwarmMetadata
} from "@bitstreamy/commons";
import React, { Component } from "react";
import LaptopCheckOutline from "../../assets/images/laptop-check-outline.png";
import PeerNetworkOutline from "../../assets/images/peer-network-outline.png";
import RadarOutline from "../../assets/images/radar-outline.png";
import { Column } from "../../components/Column";
import { Container } from "../../components/Container";
import { H1 } from "../../components/H1";
import { H4 } from "../../components/H4";
import { GithubIcon, NpmIcon, RedditIcon } from "../../components/Icon";
import { ExternalLink } from "../../components/Link";
import { P } from "../../components/P";
import { Row } from "../../components/Row";
import { TopNav } from "../../components/TopNav";
import { LiveStreams } from "./components/LiveStreams";
import {
  BroadcastButton,
  ContactInformationContainer,
  CopyrightInformation,
  FatArrowUp,
  Feature,
  FeaturedVideoPlayer,
  FeaturesContainer,
  FeaturesTitleContainer,
  LiveBroadcastsSection,
  SocialLink,
  SocialLinksContainer
} from "./styles";
import { ViewportContext } from "../../components/ViewportProvider";

const featuredPlayerSwarmMetadata = new SwarmMetadata(
  Buffer.from("aaa"),
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

const mockLiveStreams = [
  { id: "1", title: "Juventus - Roma", peers: 34 },
  { id: "2", title: "Juventus - Roma", peers: 34 },
  { id: "3", title: "Juventus - Roma", peers: 34 },
  { id: "4", title: "Juventus - Roma", peers: 34 }
];

export class Home extends Component {
  public static contextType = ViewportContext;
  public context!: React.ContextType<typeof ViewportContext>;

  public render() {
    const { mobile, tablet } = this.context;

    return (
      <div>
        {(mobile || tablet) && <TopNav />}

        <FeaturedVideoPlayer
          liveDiscardWindow={10}
          swarmMetadata={featuredPlayerSwarmMetadata}
          poster="https://images.wallpaperscraft.com/image/football_game_field_tribune_gate_spectators_11418_1920x1080.jpg"
        />

        <LiveBroadcastsSection>
          <Container>
            <Row>
              <Column span={[12, 16]}>
                <Row>
                  {mobile && <Column />}
                  <Column span={[10]}>
                    <H1 dark translucent>
                      Broadcast
                    </H1>
                  </Column>
                </Row>

                <Row>
                  <Column span={[2]} />
                  <Column span={[9, 10]}>
                    <H1 dark>and watch like</H1>
                  </Column>
                </Row>

                <Row>
                  {mobile && <Column />}
                  <Column span={[10]}>
                    <H1 dark>never before</H1>
                  </Column>
                </Row>
              </Column>

              <Column span={[12, 16]}>
                <BroadcastButton>Broadcast now</BroadcastButton>
              </Column>
            </Row>

            <Row>
              {mobile && <Column />}
              <Column span={[11, 12]}>
                <LiveStreams streams={mockLiveStreams} />
              </Column>
            </Row>
          </Container>
        </LiveBroadcastsSection>

        <Container>
          <FeaturesTitleContainer>
            <Row>
              <Column span={[1, 2]} />
              <Column span={[10]}>
                <H1 translucent>No more buffering</H1>
                <H1 translucent>and bad quality</H1>
              </Column>
            </Row>
            <Row>
              <Column span={[2, 3]} />
              <Column span={[9]}>
                <H1>Why Bitstreamy</H1>
              </Column>
            </Row>
            <Row>
              <Column span={[1, 2]} />
              <Column span={[10]}>
                <H1>is better.</H1>
              </Column>
            </Row>
          </FeaturesTitleContainer>

          <FeaturesContainer>
            <Feature>
              <H4>Peer to Peer</H4>
              <P translucent>
                Text here to explain briefly whats this point. Obviously not
                more than 3/4 lines.
              </P>
              <img src={PeerNetworkOutline} />
            </Feature>

            <Feature>
              <H4>Open Source</H4>

              <P translucent>
                Text here to explain briefly whats this point. Obviously not
                more than 3/4 lines.
              </P>

              <img src={RadarOutline} />
            </Feature>

            <Feature>
              <H4>Based on Standards</H4>

              <P translucent>
                Text here to explain briefly whats this point. Obviously not
                more than 3/4 lines.
              </P>

              <img src={LaptopCheckOutline} />
            </Feature>
          </FeaturesContainer>

          <SocialLinksContainer>
            <SocialLink>
              <Column />

              <Column>
                <GithubIcon width="30px" />
              </Column>

              <Column />

              <Column span={[9]}>
                <ExternalLink href="https://www.github.com/">
                  <H4>Github</H4>
                </ExternalLink>
              </Column>
            </SocialLink>

            <SocialLink>
              <Column />

              <Column>
                <NpmIcon width="30px" />
              </Column>

              <Column />

              <Column span={[9]}>
                <ExternalLink>
                  <H4>NPM</H4>
                </ExternalLink>
              </Column>
            </SocialLink>

            <SocialLink>
              <Column />

              <Column>
                <RedditIcon width="30px" />
              </Column>

              <Column />

              <Column span={[9]}>
                <ExternalLink>
                  <H4>Reddit</H4>
                </ExternalLink>
              </Column>
            </SocialLink>

            <FatArrowUp />
          </SocialLinksContainer>

          <Row>
            <Column span={[3]} />

            <Column span={[8]}>
              <ContactInformationContainer>
                <H4>Contact</H4>

                <ExternalLink href="mailto:hello@bitstreamy.com">
                  <H4>hello@bitstreamy.com</H4>
                </ExternalLink>
              </ContactInformationContainer>

              <CopyrightInformation translucent>
                ©2019 — All rights reserved.
              </CopyrightInformation>
            </Column>
          </Row>
        </Container>
      </div>
    );
  }
}
