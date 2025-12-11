"use client";

import { AlertSubscriptionButton } from "@/components/common/alert-subscription-button";
import { JobInformation } from "@/components/common/job-information";
import { Button } from "@/components/ui/button";
import { deriveAlertFromJob } from "@/lib/alert-helpers";
import type { JobI } from "@/lib/types";
import {
	cleanAndDecodeHtml,
	cleanString,
	cn,
	formatDate,
	getJobInfoItems,
} from "@/lib/utils";
import parse from "html-react-parser";
import {
	BarChart3,
	Briefcase,
	Building2,
	CalendarDays,
	Clock,
	Coins,
	FileText,
	Globe,
	Languages,
	MapPin,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type React from "react";
import { TitleCard } from "../cards/title-card";
import { Sidebar } from "./sidebar";

export function JobDetailClient({
	job,
}: {
	job: JobI;
}) {
	const {
		aiBenefits,
		aiKeySkills,
		aiTaxonomiesA,
		linkedinOrgDescription,
		organization,
		remoteDerived,
		datePosted,
	} = job;
	const {
		salary,
		location,
		experienceLevel,
		employmentType,
		workingHours,
		jobLanguage,
		visaSponsorship,
		companySize,
		coreResponsibilities,
	} = getJobInfoItems(job);

	const jobInfoItems = useMemo(
		() => [
			{
				icon: Building2,
				label: "Company",
				value: organization,
			},
			{
				icon: MapPin,
				label: "Location",
				value: location,
			},
			{
				icon: Briefcase,
				label: "Work Mode",
				value: remoteDerived ? "Remote" : "On Site",
			},
			{
				icon: CalendarDays,
				label: "Posted",
				value: formatDate(datePosted),
			},
		],
		[organization, remoteDerived, datePosted, location],
	);

	return (
		<div>
			<div className="mx-auto max-w-sub-container border-x-2">
				<TitleCard
					title="JOB DETAILS"
					classNames="rounded-none"
					withBackgroundImage
				>
					<h1 className="mb-4 max-w-para-lg font-bold text-4xl">{job.title}</h1>
					<JobInformation items={jobInfoItems} />
				</TitleCard>
				<div className="relative mx-auto p-5">
					<div className="grid gap-5 lg:grid-cols-[1fr_350px]">
						<div className="space-y-8">
							<div className="space-y-4">
								<TitleCard
									title="Job Information"
									classNames="border-2 space-y-5"
								>
									<div className="mb-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
										{[
											{
												icon: FileText,
												label: "Core Responsibilities",
												value: coreResponsibilities,
												classNames:
													"text-sm font-normal md:col-span-2 lg:col-span-3",
											},
											{
												icon: Briefcase,
												label: "Job Type",
												value: cleanString(employmentType ?? "").toLowerCase(),
											},

											{
												icon: Coins,
												label: "Salary Range",
												value: salary,
												highlight: true,
											},
											{
												icon: BarChart3,
												label: "Experience Level",
												value: experienceLevel,
											},
											{
												icon: Users,
												label: "Company Size",
												value: companySize,
											},
											{
												icon: Globe,
												label: "Visa Sponsorship",
												value: visaSponsorship,
											},
											{
												icon: Languages,
												label: "Language",
												value: jobLanguage,
											},
											{
												icon: Clock,
												label: "Working Hours",
												value: workingHours,
											},
										]
											.filter((item) => item.value)
											.map((item) => {
												const IconComponent = item.icon;
												return (
													<div
														key={item.label}
														className={cn(
															"space-y-2.5 capitalize",
															item.classNames,
														)}
													>
														<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
															<IconComponent className="size-4" />
															<span className="font-bold font-jet-brains-mono">
																{item.label}
															</span>
														</div>
														<div
															className={cn(
																"font-jet-brains-mono text-[14px]",
																item.highlight && "text-green-600",
																item.classNames,
															)}
														>
															{item.value}
														</div>
													</div>
												);
											})}
									</div>
									<TitleCard classNames="border-2">
										<div className="space-y-2">
											<AlertSubscriptionButton
												alertData={deriveAlertFromJob(job)}
												size="lg"
												className="w-full"
											/>
											<Button size="lg" className="w-full" asChild>
												<Link href={job.url} target="_blank">
													Apply Now →
												</Link>
											</Button>
											<p className="mt-4 text-center text-muted-foreground text-xs">
												You'll be redirected to
												<br />
												the company's application page
											</p>
										</div>
									</TitleCard>
								</TitleCard>
							</div>
							<TitleCard title="About The Company" classNames="border-2">
								{linkedinOrgDescription ? (
									<div className="prose prose-sm sm:prose base prose-neutral whitespace-pre-line">
										{linkedinOrgDescription}
									</div>
								) : (
									<p className="text-muted-foreground">
										No description available for this Company.
									</p>
								)}
							</TitleCard>
							<TitleCard title="About the Role" classNames="border-2">
								{job.descriptionHtml ? (
									<div className="prose prose-sm sm:prose base lg:prose-lg prose-neutral max-w-none prose-code:rounded prose-img:rounded-xl prose-img:border prose-blockquote:border-muted-foreground/40 prose-img:border-border prose-blockquote:border-l-4 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-blockquote:pl-4 prose-headings:font-semibold prose-a:text-primary prose-headings:text-foreground prose-strong:text-foreground prose-blockquote:italic prose-a:no-underline hover:prose-a:underline">
										{parse(cleanAndDecodeHtml(job.descriptionHtml))}
									</div>
								) : (
									<p className="text-muted-foreground">
										No description available for this position.
									</p>
								)}
							</TitleCard>
							{aiKeySkills && aiKeySkills.length > 0 && (
								<TitleCard title="Key Skills" classNames="border-2">
									<div className="flex flex-wrap gap-2">
										{aiKeySkills.map((skill) => (
											<span
												key={skill}
												className="rounded-sm border border-border bg-muted px-3 py-1.5 font-medium text-foreground text-sm"
											>
												{skill}
											</span>
										))}
									</div>
								</TitleCard>
							)}
							{aiTaxonomiesA && aiTaxonomiesA.length > 0 && (
								<TitleCard title="Categories" classNames="border-2">
									<div className="flex flex-wrap gap-2">
										{aiTaxonomiesA.map((category) => (
											<span
												key={category}
												className="rounded-sm border border-border bg-muted px-3 py-1.5 font-medium text-foreground text-sm"
											>
												{category}
											</span>
										))}
									</div>
								</TitleCard>
							)}
							{aiBenefits && (
								<TitleCard title="Benefits" classNames="border-2">
									<div className="flex flex-wrap gap-2">
										{aiBenefits.map((benefit) => (
											<span
												key={benefit}
												className="rounded-sm border border-border bg-muted px-3 py-1.5 font-medium text-foreground text-sm"
											>
												{benefit}
											</span>
										))}
									</div>
								</TitleCard>
							)}
						</div>
						<div className="hidden border-x-2 bg-background px-4 py-2 lg:block">
							<Sidebar job={job} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
