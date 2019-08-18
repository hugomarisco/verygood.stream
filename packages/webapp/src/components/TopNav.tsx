import React from "react";
import { desktop, tablet } from "../utils/media";
import { styled } from "../utils/theme";
import { RawLink } from "./Link";
import { Logo } from "./Logo";

export const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px;

  ${tablet`
    padding: 30px 60px;
  `}
`;

export interface ITopNavProps {
  className?: string;
}

export const TopNav = (props: ITopNavProps) => (
  <Wrapper {...props}>
    <RawLink to="/">
      <Logo />
    </RawLink>
  </Wrapper>
);
