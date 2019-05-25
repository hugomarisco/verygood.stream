import React, { Component } from "react";
import { Box, Flex, Image } from "rebass";
import FatArrowUpIcon from "../../assets/icons/fat-arrow-up.svg";
import LaptopCheckOutline from "../../assets/images/laptop-check-outline.png";
import PeerNetworkOutline from "../../assets/images/peer-network-outline.png";
import RadarOutline from "../../assets/images/radar-outline.png";
import { Link } from "../../components/Link";
import { BiggerText, BoldHeader, RegularText } from "../../components/Text";
import { Header } from "./components/Header";
import { LiveStreams } from "./components/LiveStreams";
import { PageWrapper, Video } from "./styles";

export class Home extends Component {
  public render() {
    return (
      <PageWrapper>
        <Header />
        <Video src="https://images.wallpaperscraft.com/image/football_game_field_tribune_gate_spectators_11418_1920x1080.jpg" />
        <Flex bg="white">
          <Box width="100%">
            <Flex>
              <Box>
                <BoldHeader color="fadeBlack40">Broadcast</BoldHeader>
                <BoldHeader color="black">and watch like</BoldHeader>
                <BoldHeader color="black">never before</BoldHeader>
              </Box>
            </Flex>

            <RegularText color="fadeBlack40">Now live</RegularText>

            <LiveStreams />
          </Box>
        </Flex>
        <Box bg="black">
          <Flex>
            <Box>
              <BoldHeader color="fadeWhite40">No more buffering</BoldHeader>
              <BoldHeader color="fadeWhite40">and bad quality</BoldHeader>
              <BoldHeader color="white">Why Bitstreamy</BoldHeader>
              <BoldHeader color="white">is better.</BoldHeader>
            </Box>
          </Flex>

          <Flex justifyContent="space-between">
            <Image src={PeerNetworkOutline} />

            <BiggerText color="white">Peer to Peer</BiggerText>

            <RegularText color="fadeWhite40">
              Text here to explain briefly whats this point. Obviously not more
              than 3/4 lines.
            </RegularText>
          </Flex>

          <Flex justifyContent="space-between">
            <Image src={RadarOutline} />

            <BiggerText color="white">Open Source</BiggerText>

            <RegularText color="fadeWhite40">
              Text here to explain briefly whats this point. Obviously not more
              than 3/4 lines.
            </RegularText>
          </Flex>

          <Flex justifyContent="space-between">
            <Image src={LaptopCheckOutline} />

            <BiggerText color="white">Based on Standards</BiggerText>

            <RegularText color="fadeWhite40">
              Text here to explain briefly whats this point. Obviously not more
              than 3/4 lines.
            </RegularText>
          </Flex>

          <Flex>
            <Image src={FatArrowUpIcon} />

            <Box>
              <Link>
                <BiggerText>Github</BiggerText>
              </Link>

              <Link>
                <BiggerText>NPM</BiggerText>
              </Link>

              <Link>
                <BiggerText>Reddit</BiggerText>
              </Link>
            </Box>

            <Box>
              <BiggerText>Contact</BiggerText>

              <Link>
                <BiggerText>hello@bitstreamy.com</BiggerText>
              </Link>
            </Box>
          </Flex>
        </Box>
      </PageWrapper>
    );
  }
}
