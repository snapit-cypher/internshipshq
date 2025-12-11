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
	CheckoutButton,
	HeroImageWithCards,
	JobCard,
	Logo,
	ProTipsSection,
} from "./components/helpers";

export const DailyDigestEmail: React.FC<{
	jobs: JobCardI[];
	isPro: boolean;
	checkoutUrl?: string | null;
	baseUrl: string;
	unsubscribeUrl: string;
	totalJobCount: number;
}> = ({ jobs, isPro, checkoutUrl, baseUrl, unsubscribeUrl, totalJobCount }) => {
	const today = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<Html>
			<Head />
			<Preview>Today's fresh internships - new openings posted today</Preview>
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
						boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
									fontSize: "28px",
									fontWeight: 700,
									color: "#1A1B25",
									lineHeight: 1.3,
								}}
							>
								Your daily internship digest
							</Text>
						</Section>
						<Section style={{ textAlign: "center", padding: "0 30px 24px" }}>
							<Text
								style={{
									margin: 0,
									fontSize: "16px",
									color: "#1A1B25",
								}}
							>
								{today}
							</Text>
						</Section>
						<HeroImageWithCards
							totalJobCount={totalJobCount}
							variant="daily-digest"
						/>
					</Section>
					<br />
					<Section style={{ padding: "10px 20px 30px 20px" }}>
						<Text
							style={{
								fontSize: "16px",
								color: "#475569",
								margin: "0 0 10px 0",
							}}
						>
							Hey 👋, here's what dropped today:
						</Text>
						{jobs.map((job) => (
							<JobCard key={job.id} job={job} baseUrl={baseUrl} />
						))}
						<ProTipsSection baseUrl={baseUrl} />
					</Section>
					<Section style={{ textAlign: "center", padding: "0 20px 24px" }}>
						<Text
							style={{
								margin: "0 0 4px 0",
								fontSize: "14px",
								color: "#4b5563",
							}}
						>
							Fresh internships every day. Completely free. Early access
							forever.
						</Text>
						<Text
							style={{
								margin: "14px 0 4px 0",
								fontSize: "14px",
								color: "#111827",
							}}
						>
							Apply early, not last.
						</Text>
						<Text
							style={{
								margin: 0,
								fontSize: "14px",
								fontWeight: 600,
								color: "#111827",
							}}
						>
							InternshipsHQ Team
						</Text>
					</Section>
					<BottomCta baseUrl={baseUrl} unsubscribeUrl={unsubscribeUrl} />
				</Container>
			</Body>
		</Html>
	);
};
