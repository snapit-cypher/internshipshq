import { Img, Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";

import type { JobCardI } from "@/lib/types";

/**
 * Calculate relative time string from a date
 */
function getRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - new Date(date).getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffHours / 24);

	if (diffMs < 0) {
		return "Just posted";
	}

	if (diffHours < 1) {
		return "Just posted";
	}

	if (diffHours === 1) {
		return "Posted 1 hour ago";
	}

	if (diffHours < 24) {
		return `Posted ${diffHours} hours ago`;
	}

	if (diffDays === 1) {
		return "Posted 1 day ago";
	}

	return `Posted ${diffDays} days ago`;
}

/**
 * Format job count for display (e.g., "100+" for large numbers)
 */
function formatJobCount(count: number): string {
	if (count >= 100) {
		return `${Math.floor(count / 100) * 100}+`;
	}
	return count.toString();
}

export const BottomCta = ({
	baseUrl,
	unsubscribeUrl,
	withNewsletterText = true,
	newletterText = "You're receiving this because you subscribed to our newsletter at InternshipsHQ.",
}: {
	baseUrl: string;
	unsubscribeUrl?: string | null | undefined;
	withNewsletterText?: boolean;
	newletterText?: string;
}) => {
	const newsletterText =
		newletterText ||
		"You're receiving this because you subscribed to our newsletter at InternshipsHQ.";
	return (
		<Section
			style={{
				borderTop: "1px solid #e5e7f0",
				padding: "20px",
				textAlign: "center",
			}}
		>
			{withNewsletterText && (
				<Text
					style={{
						fontSize: "12px",
						color: "#9ca3af",
						margin: "0 0 10px 0",
					}}
				>
					{newsletterText}
				</Text>
			)}
			<Text
				style={{
					fontSize: "12px",
					color: "#9ca3af",
					margin: 0,
				}}
			>
				<a
					href={`${baseUrl}/privacy`}
					style={{ color: "#6b7280", textDecoration: "none" }}
				>
					Privacy policy
				</a>
				<span> • </span>
				<a
					href={`${baseUrl}/terms`}
					style={{ color: "#6b7280", textDecoration: "none" }}
				>
					Terms of service
				</a>
				<span> • </span>
				<a
					href="mailto:support@internshipshq.com"
					style={{ color: "#6b7280", textDecoration: "none" }}
				>
					Contact Us
				</a>
				<span> • </span>
				{unsubscribeUrl && (
					<a
						href={unsubscribeUrl}
						style={{ color: "#6b7280", textDecoration: "none" }}
					>
						Unsubscribe
					</a>
				)}
			</Text>
		</Section>
	);
};

export const Logo = ({ baseUrl }: { baseUrl: string }) => {
	return (
		<Section
			style={{
				padding: "12px 20px",
				borderBottom: "1px solid #E5E5E5",
				textAlign: "center",
			}}
		>
			<Img
				alt="InternshipsHQ Logo"
				src={`${baseUrl}/logo.png`}
				width={150}
				height={40}
				style={{
					display: "block",
					width: "150px",
					height: "40px",
					objectFit: "contain",
					objectPosition: "center",
					margin: "0 auto",
				}}
			/>
		</Section>
	);
};

export const CheckoutButton = ({
	checkoutUrl,
}: { checkoutUrl: string | null | undefined }) => {
	return (
		<Section style={{ marginTop: "16px", padding: 0 }}>
			<table
				width="100%"
				cellPadding={0}
				cellSpacing={0}
				style={{ borderCollapse: "collapse" }}
			>
				<tbody>
					<tr>
						<td>
							<a
								href={checkoutUrl ?? "#"}
								style={{
									display: "block",
									padding: "14px 18px",
									borderRadius: "10px",
									backgroundColor: "#2563eb",
									textAlign: "center",
									textDecoration: "none",
									fontSize: "15px",
									fontWeight: 600,
									color: "#ffffff",
								}}
							>
								👉 Unlock everything: $9/month
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</Section>
	);
};

export const ProTipsSection = ({ baseUrl }: { baseUrl: string }) => {
	return (
		<Section
			style={{
				marginTop: "32px",
				padding: "20px",
				borderRadius: "14px",
				border: "1px solid #dbeafe",
				backgroundColor: "#f8fbff",
			}}
		>
			<table
				width="100%"
				cellPadding={0}
				cellSpacing={0}
				style={{ borderCollapse: "collapse" }}
			>
				<tbody>
					<tr>
						<td style={{ verticalAlign: "top" }}>
							<Text
								style={{
									margin: "0 0 6px 0",
									fontSize: "16px",
									fontWeight: 600,
									color: "#111827",
								}}
							>
								Make the most of your feed.
							</Text>
							<Text
								style={{
									margin: 0,
									fontSize: "14px",
									lineHeight: 1.5,
									color: "#4b5563",
								}}
							>
								Use filters to see every internship that matches your interests
								across all sources.
							</Text>
						</td>
						<td
							align="right"
							style={{ verticalAlign: "middle", paddingLeft: "12px" }}
						>
							<a
								href={`${baseUrl}/jobs`}
								style={{
									padding: "10px 18px",
									backgroundColor: "#2563eb",
									color: "#ffffff",
									fontSize: "14px",
									fontWeight: 600,
									borderRadius: "8px",
									textDecoration: "none",
									whiteSpace: "nowrap",
									display: "inline-block",
								}}
							>
								👉 See all internships →
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</Section>
	);
};

const pillStyle: CSSProperties = {
	display: "inline-block",
	padding: "4px 10px",
	borderRadius: "3px",
	backgroundColor: "#F2F2F4",
	fontSize: "12px",
	color: "#111827",
	lineHeight: 1.3,
};

const separatorStyle: CSSProperties = {
	display: "block",
	width: "14px",
	height: "1px",
	backgroundColor: "#e5e7eb",
};

export const JobCard: React.FC<{ job: JobCardI; baseUrl: string }> = ({
	job,
	baseUrl,
}) => {
	const jobUrl = `${baseUrl}/jobs/${job.id}`;
	const relativeTime = getRelativeTime(job.datePosted);

	// Get location display - prefer cities, fallback to countries, then "Remote"
	const locationDisplay =
		job.citiesDerived?.[0] ||
		job.countriesDerived?.[0] ||
		(job.remoteDerived ? "Remote" : "Location TBD");

	// Get category display
	const categoryDisplay = job.aiTaxonomiesA?.[0] || "General";

	return (
		<Section
			style={{
				border: "1px solid #e5e7eb",
				borderRadius: "12px",
				padding: "16px 20px",
				marginBottom: "16px",
				backgroundColor: "#ffffff",
			}}
		>
			<table
				width="100%"
				cellPadding={0}
				cellSpacing={0}
				style={{ borderCollapse: "collapse" }}
			>
				<tbody>
					{/* Header Row: Title + Posted Time */}
					<tr>
						<td style={{ paddingBottom: "4px" }}>
							<table
								width="100%"
								cellPadding={0}
								cellSpacing={0}
								style={{ borderCollapse: "collapse" }}
							>
								<tbody>
									<tr>
										<td style={{ verticalAlign: "top" }}>
											<a
												href={jobUrl}
												style={{
													margin: 0,
													fontSize: "15px",
													fontWeight: 600,
													color: "#111827",
													lineHeight: 1.2,
													textDecoration: "none",
												}}
											>
												{job.title}
											</a>
										</td>
										<td
											align="right"
											style={{
												fontSize: "12px",
												color: "#9ca3af",
												whiteSpace: "nowrap",
												verticalAlign: "top",
											}}
										>
											{relativeTime}
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>

					{/* Company Name */}
					<tr>
						<td style={{ paddingBottom: "10px" }}>
							<span
								style={{
									fontSize: "13px",
									color: "#6b7280",
									fontWeight: 600,
								}}
							>
								{job.organization}
							</span>
						</td>
					</tr>
					<br />
					{/* Pills + Apply Now Link Row */}
					<tr>
						<td>
							<table
								width="100%"
								cellPadding={0}
								cellSpacing={0}
								style={{ borderCollapse: "collapse" }}
							>
								<tbody>
									<tr>
										{/* Pills */}
										<td style={{ verticalAlign: "middle" }}>
											<table
												cellPadding={0}
												cellSpacing={0}
												style={{ borderCollapse: "collapse" }}
											>
												<tbody>
													<tr>
														<td style={{ paddingRight: "8px" }}>
															<span style={pillStyle}>{locationDisplay}</span>
														</td>
														<td style={{ paddingRight: "8px" }}>
															<span style={separatorStyle} />
														</td>
														<td>
															<span style={pillStyle}>{categoryDisplay}</span>
														</td>
													</tr>
												</tbody>
											</table>
										</td>
										{/* Apply Now Link */}
										<td
											align="right"
											style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}
										>
											<a
												href={jobUrl}
												style={{
													fontSize: "12px",
													fontWeight: 600,
													color: "#2563eb",
													textDecoration: "none",
												}}
											>
												Apply Now
											</a>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
				</tbody>
			</table>
		</Section>
	);
};

/**
 * Hero image with dynamic overlay cards
 * - Daily Digest: Shows only purple card (total jobs)
 * - Job Alert: Shows both purple (total) and green (matches) cards
 * Uses table-based layout for email compatibility
 */
export const HeroImageWithCards: React.FC<{
	totalJobCount: number;
	matchCount?: number;
	variant: "daily-digest" | "job-alert";
}> = ({ totalJobCount, matchCount, variant }) => {
	const showMatchCard = variant === "job-alert" && matchCount !== undefined;

	return (
		<Section style={{ padding: "0 20px" }}>
			{/* Container table with background image */}
			<table
				width="100%"
				cellPadding={0}
				cellSpacing={0}
				style={{
					borderCollapse: "collapse",
					borderRadius: "10px",
					overflow: "hidden",
				}}
			>
				<tbody>
					<tr>
						<td
							style={{
								height: "200px",
								backgroundImage:
									"url('https://ik.imagekit.io/db57ncj9m/Dayonejobs/emails/daily-digest-img.png?updatedAt=1763817326274')",
								backgroundSize: "cover",
								backgroundPosition: "center",
								borderRadius: "10px",
								verticalAlign: "top",
							}}
						>
							{/* Nested table structure for positioning cards at top-left with padding */}
							<table
								width="100%"
								cellPadding={0}
								cellSpacing={0}
								style={{ borderCollapse: "collapse" }}
							>
								<tbody>
									{/* Top padding row */}
									<tr>
										<td
											height="16"
											style={{ lineHeight: "16px", fontSize: "1px" }}
										>
											&nbsp;
										</td>
									</tr>
									{/* Cards row */}
									<tr>
										<td>
											<table
												cellPadding={0}
												cellSpacing={0}
												style={{ borderCollapse: "collapse" }}
											>
												<tbody>
													<tr>
														{/* Left padding */}
														<td
															width="16"
															style={{ lineHeight: "1px", fontSize: "1px" }}
														>
															&nbsp;
														</td>
														{/* Cards container */}
														<td style={{ verticalAlign: "top" }}>
															<table
																cellPadding={0}
																cellSpacing={0}
																style={{ borderCollapse: "collapse" }}
															>
																<tbody>
																	{/* Purple Card - Total Jobs */}
																	<tr>
																		<td
																			style={{
																				paddingBottom: showMatchCard
																					? "8px"
																					: "0",
																			}}
																		>
																			<table
																				cellPadding={0}
																				cellSpacing={0}
																				style={{
																					borderCollapse: "collapse",
																					backgroundColor: "#ffffff",
																					borderRadius: "8px",
																					boxShadow:
																						"0 2px 8px rgba(0,0,0,0.15)",
																				}}
																			>
																				<tbody>
																					<tr>
																						<td
																							style={{
																								padding: "8px 12px",
																								verticalAlign: "middle",
																							}}
																						>
																							{/* Purple chat bubble icon */}
																							<table
																								cellPadding={0}
																								cellSpacing={0}
																								style={{
																									borderCollapse: "collapse",
																								}}
																							>
																								<tbody>
																									<tr>
																										<td
																											style={{
																												paddingRight: "8px",
																												verticalAlign: "middle",
																											}}
																										>
																											<span
																												style={{
																													display:
																														"inline-block",
																													width: "24px",
																													height: "24px",
																													backgroundColor:
																														"#8b5cf6",
																													borderRadius: "6px",
																													textAlign: "center",
																													lineHeight: "24px",
																													fontSize: "12px",
																												}}
																											>
																												💬
																											</span>
																										</td>
																										<td
																											style={{
																												verticalAlign: "middle",
																											}}
																										>
																											<span
																												style={{
																													fontSize: "13px",
																													fontWeight: 600,
																													color: "#111827",
																													whiteSpace: "nowrap",
																												}}
																											>
																												{formatJobCount(
																													totalJobCount,
																												)}{" "}
																												new job posts today
																											</span>
																										</td>
																									</tr>
																								</tbody>
																							</table>
																						</td>
																					</tr>
																				</tbody>
																			</table>
																		</td>
																	</tr>

																	{/* Green Card - Match Count (only for job alerts) */}
																	{showMatchCard && (
																		<tr>
																			<td>
																				<table
																					cellPadding={0}
																					cellSpacing={0}
																					style={{
																						borderCollapse: "collapse",
																						backgroundColor: "#ffffff",
																						borderRadius: "8px",
																						boxShadow:
																							"0 2px 8px rgba(0,0,0,0.15)",
																					}}
																				>
																					<tbody>
																						<tr>
																							<td
																								style={{
																									padding: "8px 12px",
																									verticalAlign: "middle",
																								}}
																							>
																								{/* Green heart icon */}
																								<table
																									cellPadding={0}
																									cellSpacing={0}
																									style={{
																										borderCollapse: "collapse",
																									}}
																								>
																									<tbody>
																										<tr>
																											<td
																												style={{
																													paddingRight: "8px",
																													verticalAlign:
																														"middle",
																												}}
																											>
																												<span
																													style={{
																														display:
																															"inline-block",
																														width: "24px",
																														height: "24px",
																														backgroundColor:
																															"#10b981",
																														borderRadius: "6px",
																														textAlign: "center",
																														lineHeight: "24px",
																														fontSize: "12px",
																													}}
																												>
																													🤍
																												</span>
																											</td>
																											<td
																												style={{
																													verticalAlign:
																														"middle",
																												}}
																											>
																												<span
																													style={{
																														fontSize: "13px",
																														fontWeight: 600,
																														color: "#111827",
																														whiteSpace:
																															"nowrap",
																													}}
																												>
																													{matchCount} exact
																													matches with your
																													preferences
																												</span>
																											</td>
																										</tr>
																									</tbody>
																								</table>
																							</td>
																						</tr>
																					</tbody>
																				</table>
																			</td>
																		</tr>
																	)}
																</tbody>
															</table>
														</td>
													</tr>
												</tbody>
											</table>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
				</tbody>
			</table>
		</Section>
	);
};
