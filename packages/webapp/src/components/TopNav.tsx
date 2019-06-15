import React from "react";
import { css } from "../utils/theme";
import { Flex } from "./Flex";
import { ArrowDownIcon } from "./Icon";
import { RawLink } from "./Link";
import { Logo } from "./Logo";

export const topNavCss = css`
  padding: ${props => props.theme.spaceTokens.xl};
`;

export const TopNav = () => (
  <Flex as="header" css={topNavCss}>
    <RawLink to="/">
      <Logo />
    </RawLink>
    <ArrowDownIcon height="30px" />
  </Flex>
);
