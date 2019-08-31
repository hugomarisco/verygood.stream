import React from "react";
import { tablet } from "../utils/media";
import { styled } from "../utils/theme";
import { UnstyledButton } from "./Button";
import { ArrowDownIcon } from "./Icon";
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
  scrollToBottomButton?: boolean;
}

export const TopNav = ({
  className,
  scrollToBottomButton = false
}: ITopNavProps) => (
  <Wrapper className={className}>
    <RawLink to="/">
      <Logo />
    </RawLink>

    {scrollToBottomButton && (
      <UnstyledButton>
        <ArrowDownIcon />
      </UnstyledButton>
    )}
  </Wrapper>
);
