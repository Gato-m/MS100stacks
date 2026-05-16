import type React from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

type SectionCardProps = {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
};

export function SectionCard({ children, style }: SectionCardProps) {
	const { theme } = useTheme();

	return (
		<View
			style={[
				{
					backgroundColor: theme.colors.backgroundElement,
					// borderRadius: theme.spacing.three,
					paddingHorizontal: 0,
					paddingBottom: theme.spacing.three,
					borderBottomWidth: 2,
					borderColor:
						theme.name === "dark"
							? theme.colors.darkGray
							: theme.colors.lightGray,
					// gap: theme.spacing.two,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}
