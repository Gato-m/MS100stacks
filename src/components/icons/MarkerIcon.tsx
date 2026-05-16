import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type MarkerIconProps = {
  size?: number;
  color?: string;
  centerColor?: string;
};

export function MarkerIcon({
  size = 24,
  color = "#E22B2B",
  centerColor = "#FFFFFF",
}: MarkerIconProps) {
  return (
    <Svg
      width={(size * 572.98) / 814.8}
      height={size}
      viewBox="0 0 572.98 814.8"
      fill="none"
    >
      <Path
        d="M572.98,286.49c0,264.01-286.49,528.32-286.49,528.32,0,0-286.49-264.3-286.49-528.32C0,128.27,128.27,0,286.49,0s286.49,128.27,286.49,286.49Z"
        fill={color}
      />
      <Circle cx="286.49" cy="286.49" r="161.29" fill={centerColor} />
    </Svg>
  );
}
