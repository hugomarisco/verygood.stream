import React from "react";
import { ReactComponent as ArrowDownSvg } from "../assets/icons/arrow-down.svg";
import { ReactComponent as EyeSvg } from "../assets/icons/eye.svg";
import { ReactComponent as FullScreenSvg } from "../assets/icons/fullscreen.svg";
import { ReactComponent as GithubSvg } from "../assets/icons/github.svg";
import { ReactComponent as LiveSvg } from "../assets/icons/live.svg";
import { ReactComponent as NpmSvg } from "../assets/icons/npm.svg";
import { ReactComponent as PauseSvg } from "../assets/icons/pause.svg";
import { ReactComponent as PlaySvg } from "../assets/icons/play.svg";
import { ReactComponent as PlusSvg } from "../assets/icons/plus.svg";
import { ReactComponent as RedditSvg } from "../assets/icons/reddit.svg";
import { ReactComponent as SoccerBallSvg } from "../assets/icons/soccer-ball.svg";
import { ReactComponent as UploadDownloadSvg } from "../assets/icons/upload-download.svg";
import { styled } from "../utils/theme";

interface IIconProps {
  color?: "primary" | "dark" | "light";
  width?: string;
  height?: string;
  translucent?: boolean;
}

const withIcon = (
  IconSvg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
) => styled(IconSvg)<IIconProps>`
  display: inline-block;
  fill: ${props => props.theme.colors[props.color || "light"]};
  width: ${props => props.width || "auto"};
  height: ${props => props.height || "auto"};
  opacity: ${props => (props.translucent ? 0.4 : 1)};
`;

export const EyeIcon = withIcon(EyeSvg);
export const LiveIcon = withIcon(LiveSvg);
export const SoccerBallIcon = withIcon(SoccerBallSvg);
export const PlusIcon = withIcon(PlusSvg);
export const ArrowDownIcon = withIcon(ArrowDownSvg);
export const PauseIcon = withIcon(PauseSvg);
export const FullScreenIcon = withIcon(FullScreenSvg);
export const PlayIcon = withIcon(PlaySvg);
export const GithubIcon = withIcon(GithubSvg);
export const RedditIcon = withIcon(RedditSvg);
export const NpmIcon = withIcon(NpmSvg);
export const UploadDownloadIcon = withIcon(UploadDownloadSvg);
