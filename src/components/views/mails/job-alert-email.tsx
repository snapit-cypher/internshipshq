import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import type * as React from "react";

import type { JobCardI } from "@/lib/types";
import {
	BottomCta,
	HeroImageWithCards,
	JobCard,
	Logo,
	ProTipsSection,
} from "./components/helpers";

export const JobAlertEmail: React.FC<{
	alertName: string;
	jobs: JobCardI[];
	baseUrl: string;
	totalJobCount: number;
}> = ({ alertName, jobs, baseUrl, totalJobCount }) => {
	return (
		<Html>
			<Head />
			<Preview>
				{`${jobs.length} new ${jobs.length === 1 ? "internship" : "internships"} for "${alertName}"`}
			</Preview>
			<Body
				style={{
					fontFamily: "Arial, sans-serif",
					backgroundColor: "#f6f9fc",
					padding: "40px 0",
				}}
			>
				<Container
					style={{
						maxWidth: "600px",
						margin: "0 auto",
						backgroundColor: "#ffffff",
						borderRadius: "12px",
						overflow: "hidden",
						boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
					}}
				>
					<Section style={{ padding: 0, margin: 0 }}>
						<Logo baseUrl={baseUrl} />
						<Section
							style={{
								textAlign: "center",
								padding: "30px 30px 8px",
							}}
						>
							<Text
								style={{
									margin: 0,
									fontSize: "24px",
									fontWeight: 700,
									color: "#1A1B25",
									lineHeight: 1.3,
								}}
							>
								Your fresh internship alerts
							</Text>
						</Section>
						<Section style={{ textAlign: "center", padding: "0 30px 20px" }}>
							<Text
								style={{
									margin: 0,
									fontSize: "15px",
									color: "#4b5563",
								}}
							>
								{`${jobs.length} new ${jobs.length === 1 ? "internship" : "internships"} matching your saved alert`}
							</Text>
						</Section>
						<HeroImageWithCards
							totalJobCount={totalJobCount}
							matchCount={jobs.length}
							variant="job-alert"
						/>
					</Section>
					<Section style={{ padding: "10px 20px" }}>
						<Text
							style={{
								margin: "0 0 16px 0",
								fontSize: "14px",
								color: "#111827",
								lineHeight: 1.6,
							}}
						>
							Here are your latest matches. Apply while they&apos;re still
							fresh:
						</Text>
						{jobs.map((job) => (
							<JobCard key={job.id} job={job} baseUrl={baseUrl} />
						))}
					</Section>
					<Section
						style={{
							padding: "0px 20px 10px 20px",
							textAlign: "left",
						}}
					>
						<ProTipsSection baseUrl={baseUrl} />
					</Section>
					<BottomCta baseUrl={baseUrl} withNewsletterText={false} />
				</Container>
			</Body>
		</Html>
	);
};
