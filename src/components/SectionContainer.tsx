import type React from "react";
import {
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/design/ThemeProvider";

type SectionContainerProps = ViewProps & {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	tabletBreakpoint?: number;
	maxWidth?: number;
	gap?: number;
	fromScreenTop?: boolean;
};

export function SectionContainer({
	children,
	style,
	tabletBreakpoint = 768,
	maxWidth,
	gap,
	fromScreenTop = false,
	...rest
}: SectionContainerProps) {
	const { theme } = useTheme();
	const { width } = useWindowDimensions();
	const isTablet = width >= tabletBreakpoint;

	return (
		<View
			{...rest}
			style={[
				{
					width: "95%",
					alignSelf: "center",
					paddingHorizontal: theme.spacing.three,
					borderWidth: 1,
					borderColor: theme.colors.backgroundSelected,
					borderRadius: theme.spacing.three,
					marginTop: fromScreenTop ? theme.layout.ScreenTopToFirstComponent : 0,
					gap: gap ?? theme.spacing.three,
					marginBottom: -20,
				},
				isTablet && {
					maxWidth: maxWidth ?? theme.layout.MaxContentWidth,
					alignSelf: "center",
					marginTop: fromScreenTop ? theme.layout.ScreenTopToFirstComponent : 0,
					paddingHorizontal: theme.spacing.three,
					borderWidth: 1,
					borderColor: theme.colors.backgroundSelected,
					borderRadius: theme.spacing.three,
					marginBottom: 30,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}
