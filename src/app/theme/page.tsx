import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper, TitleWrapper } from "@/wrappers";

import { Buttons } from "@/components/views/theme/buttons";
import { Colors } from "@/components/views/theme/colors";
import { Typography } from "@/components/views/theme/typography";

export default function Theme() {
	const tabsList = [
		{
			title: "Colors",
			key: "colors",
			component: <Colors />,
		},
		{
			title: "Typography",
			key: "typography",
			component: <Typography />,
		},
		{
			title: "Buttons",
			key: "buttons",
			component: <Buttons />,
		},
	];

	return (
		<PageWrapper showCta={false}>
			<TitleWrapper
				sectionName="THE DayOne Jobs THEME"
				title="The DayOne Jobs Theme"
				className="py-content"
				para="Explore our design system's colors and typography to understand how we maintain visual consistency across the platform. Use these guidelines to create cohesive and accessible user interfaces."
			>
				<Tabs defaultValue="colors" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						{tabsList.map((tab) => (
							<TabsTrigger key={tab.key} value={tab.key}>
								{tab.title}
							</TabsTrigger>
						))}
					</TabsList>
					{tabsList.map((tab) => (
						<TabsContent key={tab.key} value={tab.key}>
							{tab.component}
						</TabsContent>
					))}
				</Tabs>
			</TitleWrapper>
		</PageWrapper>
	);
}
