import React from "react";
import Svg, { Path } from "react-native-svg";

type MapInfoIconProps = {
  size?: number;
  color?: string;
  glyphColor?: string;
};

export function MapInfoIcon({
  size = 24,
  color = "#E22B2B",
  glyphColor = "#F4F4F4",
}: MapInfoIconProps) {
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
      <Path
        d="M342.63,255.81v234.83h81.86v50.36h-250.28v-50.36h90.96v-184.47h-88.02v-50.36h165.48ZM292.45,112c14.28,0,25.87,4.04,34.77,12.12,8.9,8.08,13.35,18.14,13.35,30.16s-4.45,22.13-13.35,30.3c-8.9,8.17-20.49,12.25-34.77,12.25s-25.92-4.08-34.92-12.25c-9-8.17-13.5-18.27-13.5-30.3s4.5-22.08,13.5-30.16c8.99-8.08,20.63-12.12,34.92-12.12Z"
        fill={glyphColor}
      />
    </Svg>
  );
}
