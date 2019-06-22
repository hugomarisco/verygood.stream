import { stripUnit } from "polished";
import React, { Component, createContext, ReactNode } from "react";
import { withTheme } from "styled-components";
import { Theme } from "../utils/theme";

export interface IViewportContext {
  innerHeight: number;
  innerWidth: number;
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export const ViewportContext = createContext<IViewportContext>({
  desktop: false,
  innerHeight,
  innerWidth,
  mobile: false,
  tablet: false
});

interface IProviderProps {
  theme: Theme;
  children: ReactNode;
}

export interface IViewportState {
  innerHeight: number;
  innerWidth: number;
}

class Provider extends Component<IProviderProps, IViewportState> {
  constructor(props: IProviderProps) {
    super(props);

    this.state = {
      innerHeight,
      innerWidth
    };
  }

  public onViewportResize = () => {
    this.setState({ innerHeight, innerWidth });
  };

  public componentDidMount() {
    addEventListener("resize", this.onViewportResize);
  }

  public componentWillUnmount() {
    removeEventListener("resize", this.onViewportResize);
  }

  public render() {
    const { innerWidth, innerHeight } = this.state;
    const { theme } = this.props;

    const value = {
      desktop: innerWidth >= stripUnit(theme.breakpoints.desktop),
      innerHeight,
      innerWidth,
      mobile: innerWidth < stripUnit(theme.breakpoints.tablet),
      tablet: innerWidth >= stripUnit(theme.breakpoints.tablet)
    };

    return (
      <ViewportContext.Provider value={value}>
        {this.props.children}
      </ViewportContext.Provider>
    );
  }
}

export const ViewportProvider = withTheme(Provider);
