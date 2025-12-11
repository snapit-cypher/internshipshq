import type { JobCardI } from "@/lib/types";
import { Button, Section, Text } from "@react-email/components";

export const EmailJobCard = ({
	job,
	baseUrl,
}: {
	job: JobCardI;
	baseUrl: string;
}) => {
	const salary =
		job.aiSalaryMinvalue && job.aiSalaryMaxvalue
			? `$${job.aiSalaryMinvalue.toLocaleString()} - $${job.aiSalaryMaxvalue.toLocaleString()}`
			: null;

	const jobUrl = `${baseUrl}/jobs/${job.id}?source=email`;

	// Format location display
	const locationDisplay = [
		job.citiesDerived?.[0],
		job.countriesDerived?.[0],
		job.remoteDerived ? "Remote" : null,
	]
		.filter(Boolean)
		.join(" • ");

	// Format date posted
	const datePosted = job.datePosted
		? new Date(job.datePosted).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: null;

	return (
		<Section
			style={{
				border: "1px solid #e5e7eb",
				borderRadius: "12px",
				padding: "24px",
				marginBottom: "20px",
				backgroundColor: "#ffffff",
				boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
			}}
		>
			{/* Header Row - Title and Date */}
			<table
				width="100%"
				style={{
					marginBottom: "6px",
					borderCollapse: "collapse",
				}}
			>
				<tr>
					<td style={{ padding: 0, verticalAlign: "top" }}>
						<Text
							style={{
								margin: "0",
								fontSize: "18px",
								fontWeight: "700",
								color: "#111827",
								lineHeight: "1.3",
								letterSpacing: "-0.01em",
							}}
						>
							{job.title}
						</Text>
					</td>
					{datePosted && (
						<td
							style={{
								padding: "0",
								textAlign: "right",
								verticalAlign: "top",
								width: "120px",
							}}
						>
							<Text
								style={{
									margin: "0",
									fontSize: "12px",
									color: "#9ca3af",
									fontWeight: "500",
								}}
							>
								{datePosted}
							</Text>
						</td>
					)}
				</tr>
			</table>

			{/* Company Name - Smaller and Lighter */}
			<Text
				style={{
					margin: "0 0 16px 0",
					fontSize: "15px",
					color: "#6b7280",
					lineHeight: "1.5",
				}}
			>
				{job.organization}
				{locationDisplay && ` • ${locationDisplay}`}
			</Text>

			{/* Salary - Prominent Green */}
			{salary && (
				<Text
					style={{
						margin: "0 0 16px 0",
						fontSize: "17px",
						fontWeight: "700",
						color: "#059669",
						lineHeight: "1.4",
					}}
				>
					{salary}
				</Text>
			)}

			{/* Categories/Tags - Less Rounded */}
			{job.aiTaxonomiesA && job.aiTaxonomiesA.length > 0 && (
				<Section
					style={{
						marginBottom: "20px",
						lineHeight: "1.6",
					}}
				>
					{job.aiTaxonomiesA.slice(0, 3).map((category) => (
						<span
							key={category}
							style={{
								display: "inline-block",
								padding: "6px 14px",
								marginRight: "8px",
								marginBottom: "8px",
								backgroundColor: "#f3f4f6",
								borderRadius: "6px",
								fontSize: "13px",
								color: "#374151",
								fontWeight: "500",
								border: "1px solid #e5e7eb",
							}}
						>
							{category}
						</span>
					))}
					{job.aiTaxonomiesA.length > 3 && (
						<span
							style={{
								display: "inline-block",
								padding: "6px 14px",
								marginRight: "8px",
								marginBottom: "8px",
								backgroundColor: "#f3f4f6",
								borderRadius: "6px",
								fontSize: "13px",
								color: "#374151",
								fontWeight: "500",
								border: "1px solid #e5e7eb",
							}}
						>
							+{job.aiTaxonomiesA.length - 3} more
						</span>
					)}
				</Section>
			)}

			{/* View Job Button - Full Width */}
			<table
				width="100%"
				style={{
					marginTop: "0",
					borderCollapse: "collapse",
				}}
			>
				<tr>
					<td style={{ padding: 0 }}>
						<Button
							href={jobUrl}
							style={{
								display: "block",
								width: "100%",
								padding: "12px 24px",
								backgroundColor: "#2563eb",
								color: "#ffffff",
								textDecoration: "none",
								borderRadius: "8px",
								fontSize: "15px",
								fontWeight: "600",
								border: "none",
								boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
								textAlign: "center",
								boxSizing: "border-box",
							}}
						>
							View Job Post →
						</Button>
					</td>
				</tr>
			</table>
		</Section>
	);
};
