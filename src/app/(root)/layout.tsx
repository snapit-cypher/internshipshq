import { Header } from "@/components/common/header";
import React from "react";

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<React.Fragment>
			<Header />
			{children}
		</React.Fragment>
	);
}
