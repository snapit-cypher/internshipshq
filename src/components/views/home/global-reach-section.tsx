import ReactCountryFlag from "react-country-flag";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TitleWrapper } from "@/wrappers";

export const GlobalReachSection = () => {
	return (
		<TitleWrapper
			title="A global job feed that shows you opportunities others will miss"
			para="We scan hiring sources across North America, Europe, and Asia-Pacific every minute, including company career pages, niche boards, and regional platforms most job seekers never check."
			className="pb-content-lg"
		>
			<div className="grid gap-4 md:grid-cols-3">
				{[
					{
						title: "🇺🇸 North America",
						countries: [
							{ name: "United States", code: "US" },
							{ name: "Canada", code: "CA" },
							{ name: "Mexico", code: "MX" },
						],
						description:
							"Fresh listings from the US, Canada, and Mexico, pulled from major boards, startup platforms, and thousands of company career pages.",
					},
					{
						title: "🇬🇧 Europe",
						countries: [
							{ name: "United Kingdom", code: "GB" },
							{ name: "Germany", code: "DE" },
							{ name: "France", code: "FR" },
							{ name: "Netherlands", code: "NL" },
						],
						description:
							"Roles across the UK, EU, and Nordic markets, aggregated from regional platforms rarely monitored outside their countrie.",
					},
					{
						title: "Asia & Rest of World",
						countries: [
							{ name: "Singapore", code: "SG" },
							{ name: "UAE", code: "AE" },
							{ name: "Japan", code: "JP" },
							{ name: "Australia", code: "AU" },
							{ name: "India", code: "IN" },
						],
						description:
							"Expanding coverage across Asia-Pacific, Middle East, and emerging markets, including hard-to-find listings from local hiring sources.",
					},
				].map((region) => (
					<Card key={region.title} className="py-5">
						<CardContent className="space-y-4 px-5">
							<div className="flex flex-wrap gap-2">
								{region.countries.map((country) => (
									<div
										key={country.name}
										className={cn(
											"inline-flex items-center gap-2 rounded-md border border-border bg-muted px-2 py-1 text-sm",
										)}
									>
										<ReactCountryFlag
											countryCode={country.code}
											svg
											style={{
												width: "1.5em",
												height: "1.5em",
											}}
											title={country.name}
										/>
										<span className="font-medium text-foreground">
											{country.name}
										</span>
									</div>
								))}
							</div>
							<div className="mt-5 space-y-2">
								<CardTitle className="text-heading-h4">
									{region.title}
								</CardTitle>
								<p className="text-[15px] text-muted-foreground">
									{region.description}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</TitleWrapper>
	);
};
