import { linearGradient } from "polished";
import React from "react";
import { Box, Flex, Image } from "rebass";
import Logo from "../../../assets/images/logo.svg";
import { PrimaryButton } from "../../../components/Button";
import { styled } from "../../../components/Theme";

const HeaderWrapper = styled(Flex)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 60px;

  ${linearGradient({
    colorStops: ["#000000 0%", "#000000 45%", "rgba(0, 0, 0, 0) 100%"],
    fallback: "transparent",
    toDirection: "to bottom"
  })}
`;

export const Header = () => (
  <HeaderWrapper justifyContent="space-between" alignItems="center">
    <Box>
      <Image src={Logo} />
    </Box>
    <PrimaryButton>Broadcast now</PrimaryButton>
  </HeaderWrapper>
);
