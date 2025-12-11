import { Wrapper } from "@/wrappers";

import { LargeScreenMenuWrapper } from "./helpers/wrapper";
import { Logo } from "./logo";
import { Menu } from "./menu";
import { Sidebar } from "./sidebar";

export const Header = () => {
	return (
		<div className="sticky top-0 z-30 border-b-2 bg-background px-content-sm">
			<Wrapper>
				<nav className="mx-0 flex h-16 items-center justify-between md:mx-auto lg:grid lg:grid-cols-[1fr_auto_1fr]">
					<Logo />
					<Menu />
					<LargeScreenMenuWrapper />
					<Sidebar />
				</nav>
			</Wrapper>
		</div>
	);
};
