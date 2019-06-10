import React from "react";
import logoImage from "../assets/images/logo.svg";
import { css } from "../utils/theme";
import { Flex } from "./Flex";
import { ArrowDownIcon } from "./Icon";
import { RawLink } from "./Link";

export const topNavCss = css`
  padding: ${props => props.theme.spaceTokens.xl};
`;

export const TopNav = () => (
  <Flex as="header" css={topNavCss}>
    <RawLink to="/">
      <img src={logoImage} />
    </RawLink>
    <ArrowDownIcon />
  </Flex>
);
