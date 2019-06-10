import React from "react";
import ArrowDownPath from "../assets/icons/arrow-down.svg";
import EyeIconPath from "../assets/icons/eye.svg";
import FullScreenPath from "../assets/icons/fullscreen.svg";
import LiveIconPath from "../assets/icons/live.svg";
import PausePath from "../assets/icons/pause.svg";
import PlayPath from "../assets/icons/play.svg";
import PlusPath from "../assets/icons/plus.svg";
import SoccerBallPath from "../assets/icons/soccer-ball.svg";

const withIcon = (iconPath: string) => (props: {}) => (
  <img src={iconPath} {...props} />
);

export const EyeIcon = withIcon(EyeIconPath);
export const LiveIcon = withIcon(LiveIconPath);
export const SoccerBallIcon = withIcon(SoccerBallPath);
export const PlusIcon = withIcon(PlusPath);
export const ArrowDownIcon = withIcon(ArrowDownPath);
export const PauseIcon = withIcon(PausePath);
export const FullScreenIcon = withIcon(FullScreenPath);
export const PlayIcon = withIcon(PlayPath);
