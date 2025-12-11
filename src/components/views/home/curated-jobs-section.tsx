import Image from "next/image";
import Link from "next/link";

import chartsIcon from "public/icons/charts.png";
import codeIcon from "public/icons/code.png";
import designIcon from "public/icons/design.png";
import digitalMarketingIcon from "public/icons/digital-marketting.png";
import mapsIcon from "public/icons/maps.png";
import securityIcon from "public/icons/security.png";
import supportIcon from "public/icons/support.png";
import uiUxIcon from "public/icons/ui-ux.png";

import { Card, CardContent } from "@/components/ui/card";
import { TitleWrapper } from "@/wrappers";

export const CuratedJobsSection = ({ country }: { country: string }) => {
	return (
		<TitleWrapper
			title="Curated job lists for you."
			para="Browse curated job collections by role, company, location, and industry. Find exactly what you're looking for."
			className="pb-content-lg"
		>
			<div className="grid gap-5 md:grid-cols-2">
				{[
					{
						icon: codeIcon,
						title: "Entry level software developer jobs (Remote & Hybrid)",
						slug: "entry-level-software-developer",
					},
					{
						icon: designIcon,
						title: "Junior graphic designer remote jobs",
						slug: "junior-graphic-designer-remote",
					},
					{
						icon: chartsIcon,
						title: "Entry level data analyst jobs for beginners",
						slug: "entry-level-data-analyst",
					},
					{
						icon: digitalMarketingIcon,
						title: "Remote digital marketing assistant jobs",
						slug: "remote-digital-marketing-assistant",
					},
					{
						icon: securityIcon,
						title: "Entry level cybersecurity analyst jobs (Remote)",
						slug: "entry-level-cybersecurity-analyst",
					},
					{
						icon: supportIcon,
						title: "Virtual assistant jobs for beginners",
						slug: "virtual-assistant-jobs",
					},
					{
						icon: uiUxIcon,
						title: "Entry level UX/UI design internships for graduates",
						slug: "entry-level-ux-ui-design-internships",
					},
					{
						icon: mapsIcon,
						title: `Entry level jobs without experience in ${country}`,
						slug: "jobs-in-demand-in-your-country",
					},
				].map((job) => (
					<Link
						key={job.slug}
						href={`/${job.slug}/jobs`}
						className="transition-opacity hover:opacity-80"
					>
						<Card className="py-3">
							<CardContent className="flex items-center gap-4 px-3">
								<Image
									src={job.icon}
									alt={job.title}
									className="h-16 w-16 shrink-0 object-contain"
								/>
								<p className="font-bold text-foreground">{job.title}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</TitleWrapper>
	);
};
