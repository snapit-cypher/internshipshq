import {
	Cal_Sans as FontCalSans,
	Inter as FontInter,
	JetBrains_Mono as FontJetBrainsMono,
} from "next/font/google";

export const fontInter = FontInter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const fontCalSans = FontCalSans({
	weight: "400",
	subsets: ["latin"],
	fallback: ["Inter"],
	display: "swap",
	variable: "--font-cal-sans",
});

export const fontJetBrainsMono = FontJetBrainsMono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
	variable: "--font-jet-brains-mono",
});
