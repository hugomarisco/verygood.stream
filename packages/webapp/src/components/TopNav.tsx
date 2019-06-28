import React from "react";
import { desktop } from "../utils/media";
import { styled } from "../utils/theme";
import { Container } from "./Container";
import { RawLink } from "./Link";
import { Logo } from "./Logo";

export const Wrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px;

  ${desktop`
    padding: 60px;
  `}
`;

export interface ITopNavProps {
  className?: string;
}

export const TopNav = (props: ITopNavProps) => (
  <Wrapper {...props}>
    <Container>
      <RawLink to="/">
        <Logo />
      </RawLink>
    </Container>
  </Wrapper>
);
