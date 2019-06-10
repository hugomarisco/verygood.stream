import React, { Component } from "react";
import LaptopCheckOutline from "../../assets/images/laptop-check-outline.png";
import PeerNetworkOutline from "../../assets/images/peer-network-outline.png";
import RadarOutline from "../../assets/images/radar-outline.png";
import { Box } from "../../components/Box";
import { Button } from "../../components/Button";
import { Grid, GridCell } from "../../components/Grid";
import { H1 } from "../../components/H1";
import { H4 } from "../../components/H4";
import { Hr } from "../../components/Hr";
import { ExternalLink } from "../../components/Link";
import { P } from "../../components/P";
import { Spacer } from "../../components/Spacer";
import { TopNav } from "../../components/TopNav";
import { Video } from "../../components/Video";
import { LiveStreams } from "./components/LiveStreams";

export class Home extends Component {
  public render() {
    return (
      <div>
        <TopNav />

        <Video poster="https://images.wallpaperscraft.com/image/football_game_field_tribune_gate_spectators_11418_1920x1080.jpg" />
        <Box>
          <Spacer layout size="m" />

          <Grid>
            <GridCell row="1" column="2/-2">
              <H1 dark translucent>
                Broadcast
              </H1>
            </GridCell>

            <GridCell row="2" column="3/-2">
              <H1 dark>and watch like</H1>
            </GridCell>

            <GridCell row="3" column="2/-2">
              <H1 dark>never before</H1>
            </GridCell>
          </Grid>

          <Spacer layout size="s" />

          <div
            css={`
              text-align: center;
            `}
          >
            <Button>Broadcast now</Button>
          </div>

          <Spacer layout size="s" />

          <Grid>
            <GridCell row="1" column="2/-1">
              <LiveStreams />
            </GridCell>
          </Grid>

          <Spacer layout size="m" />
        </Box>
        <div>
          <Spacer layout size="m" />

          <Grid>
            <GridCell row="1" column="2/-2">
              <H1 translucent>No more buffering</H1>
            </GridCell>
            <GridCell row="2" column="2/-2">
              <H1 translucent>and bad quality</H1>
            </GridCell>
            <GridCell row="3" column="3/-2">
              <H1>Why Bitstreamy</H1>
            </GridCell>
            <GridCell row="4" column="2/-2">
              <H1>is better.</H1>
            </GridCell>
          </Grid>

          <Spacer layout size="m" />

          <Grid>
            <GridCell row="1" column="2/-2">
              <Hr />

              <Spacer layout size="xs" />

              <H4>Peer to Peer</H4>

              <Spacer layout size="xs" />

              <P translucent>
                Text here to explain briefly whats this point. Obviously not
                more than 3/4 lines.
              </P>

              <Spacer layout size="m" />

              <img src={PeerNetworkOutline} />

              <Spacer layout size="m" />
            </GridCell>

            <GridCell row="2" column="2/-2">
              <Hr />

              <Spacer layout size="xs" />

              <H4>Open Source</H4>

              <Spacer layout size="xs" />

              <P translucent>
                Text here to explain briefly whats this point. Obviously not
                more than 3/4 lines.
              </P>

              <Spacer layout size="m" />

              <img src={RadarOutline} />

              <Spacer layout size="m" />
            </GridCell>

            <GridCell row="3" column="2/-2">
              <Hr />

              <Spacer layout size="xs" />

              <H4>Based on Standards</H4>

              <Spacer layout size="xs" />

              <P translucent>
                Text here to explain briefly whats this point. Obviously not
                more than 3/4 lines.
              </P>

              <Spacer layout size="m" />

              <img src={LaptopCheckOutline} />
            </GridCell>
          </Grid>

          <Spacer layout size="xxl" />

          <Grid>
            <GridCell row="1" column="4/9">
              <ExternalLink href="https://www.github.com/">
                <H4>Github</H4>
              </ExternalLink>

              <Spacer size="l" />
            </GridCell>

            <GridCell row="2" column="4/9">
              <ExternalLink>
                <H4>NPM</H4>
              </ExternalLink>

              <Spacer size="l" />
            </GridCell>

            <GridCell row="3" column="4/9">
              <ExternalLink>
                <H4>Reddit</H4>
              </ExternalLink>

              <Spacer layout size="l" />
            </GridCell>

            {/* <GridCell row="1/span 3" column="9/-2">
              <img src={FatArrowUpIcon} />
            </GridCell> */}

            <GridCell row="4" column="4/-2">
              <H4>Contact</H4>

              <Spacer size="xs" />

              <ExternalLink href="mailto:hello@bitstreamy.com">
                <H4>hello@bitstreamy.com</H4>
              </ExternalLink>
            </GridCell>
          </Grid>

          <Spacer layout size="l" />

          <Grid>
            <GridCell row="1" column="4/-2">
              <P translucent>©2019 — All rights reserved.</P>

              <Spacer layout size="xxs" />
            </GridCell>

            <GridCell row="2" column="4/9">
              <P translucent>Terms &amp; Conditions</P>
            </GridCell>

            <GridCell row="2" column="9/-2">
              <P translucent>Policy</P>
            </GridCell>
          </Grid>

          <Spacer layout size="l" />
        </div>
      </div>
    );
  }
}
