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
	BookOpen,
	Briefcase,
	Building2,
	CalendarDays,
	Clock,
	Coins,
	FileQuestion,
	FileText,
	Globe,
	GraduationCap,
	Languages,
	Layers,
	MapPin,
	MessageSquareText,
	Mic,
	ScrollText,
	Sparkles,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type React from "react";
import { TitleCard } from "../../src/components/common/cards/title-card";

// ============================================================== //
// InterviewPal Tool Card Types & Configurations
// ============================================================== //

interface ToolCardConfig {
	id: string;
	trackingTitle: string;
	link: string;
	cta: string;
	renderContent: (job: JobI) => React.ReactNode;
}

function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = shuffled[i];
		shuffled[i] = shuffled[j] as T;
		shuffled[j] = temp as T;
	}
	return shuffled;
}

// Score Gauge Component for Resume Review Card
function ScoreGauge({
	score,
	label,
	color,
}: { score: string | number; label: string; color: string }) {
	const numericScore = typeof score === "number" ? score : 0;
	const rotation =
		typeof score === "number" ? (numericScore / 10) * 180 - 90 : -90;

	return (
		<div className="flex flex-col items-center gap-1">
			<div className="relative h-12 w-24 overflow-hidden">
				{/* Gauge background */}
				<div
					className="absolute bottom-0 left-0 h-24 w-24 rounded-full border-8 border-muted"
					style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 0, 0 0)" }}
				/>
				{/* Gauge fill */}
				<div
					className="absolute bottom-0 left-0 h-24 w-24 rounded-full border-8 transition-all duration-500"
					style={{
						borderColor: color,
						clipPath: "polygon(0 50%, 100% 50%, 100% 0, 0 0)",
						transform: `rotate(${rotation}deg)`,
						transformOrigin: "center center",
					}}
				/>
				{/* Score display */}
				<div className="absolute inset-x-0 bottom-0 text-center font-bold text-lg">
					{score}
				</div>
			</div>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}

// Tool Card Component
function InterviewPalToolCard({
	config,
	job,
}: { config: ToolCardConfig; job: JobI }) {
	return (
		<Link
			href={config.link}
			target="_blank"
			rel="noopener noreferrer"
			className="group block"
		>
			<div className="relative overflow-hidden rounded-lg border-2 border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md">
				{/* FREE Badge */}
				<span className="absolute top-3 right-3 rounded bg-sky-500 px-2 py-0.5 font-jet-brains-mono font-semibold text-white text-xs">
					FREE
				</span>

				{/* Tracking Title */}
				<p className="mb-4 font-jet-brains-mono text-muted-foreground text-xs uppercase tracking-widest">
					{config.trackingTitle}
				</p>

				{/* Card Content */}
				<div className="space-y-4">{config.renderContent(job)}</div>

				{/* CTA Button */}
				<Button className="mt-4 w-full" size="sm">
					{config.cta}
				</Button>
			</div>
		</Link>
	);
}

// Tool Card Configurations
const TOOL_CARDS: ToolCardConfig[] = [
	{
		id: "resume-review",
		trackingTitle: "BOOST YOUR INTERVIEW CHANCES",
		link: "https://www.interviewpal.com/resume-review",
		cta: "Optimize my Resume",
		renderContent: (job) => (
			<>
				<div className="flex items-center justify-center gap-6">
					<ScoreGauge score="?" label="Your Score" color="#94a3b8" />
					<div className="text-muted-foreground text-xl">»</div>
					<ScoreGauge score={8.5} label="Top Applicants" color="#22c55e" />
				</div>
				<div className="space-y-2">
					<p className="font-medium text-muted-foreground text-xs">
						Must-Have Skills for This Role
					</p>
					<div className="flex flex-wrap gap-1.5">
						{(job.aiKeySkills ?? job.aiTaxonomiesA ?? ["Technical Skills"])
							.slice(0, 5)
							.map((skill) => (
								<span
									key={skill}
									className="rounded border border-border bg-muted px-2 py-1 text-xs"
								>
									{skill}
								</span>
							))}
					</div>
				</div>
			</>
		),
	},
	{
		id: "cover-letter-generator",
		trackingTitle: "STAND OUT FROM THE CROWD",
		link: "https://www.interviewpal.com/cover-letter-generator",
		cta: "Generate Cover Letter",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-amber-100 to-orange-100">
						<ScrollText className="h-6 w-6 text-amber-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">AI Cover Letter</p>
						<p className="text-muted-foreground text-xs">
							Tailored for {job.organization}
						</p>
					</div>
				</div>
				<div className="space-y-1.5 rounded border border-border border-dashed bg-muted/50 p-3">
					<p className="font-medium text-xs">
						Dear {job.organization} Hiring Team,
					</p>
					<p className="line-clamp-2 text-muted-foreground text-xs">
						I am excited to apply for the {job.title} position. With my
						experience in{" "}
						{job.aiKeySkills?.slice(0, 2).join(" and ") ?? "relevant skills"}...
					</p>
					<p className="text-muted-foreground/60 text-xs italic">
						Continue with AI →
					</p>
				</div>
			</>
		),
	},
	{
		id: "study-plans",
		trackingTitle: "YOUR PERSONALIZED PREP ROADMAP",
		link: "https://www.interviewpal.com/study-plans",
		cta: "Get My Study Plan",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-violet-100 to-purple-100">
						<GraduationCap className="h-6 w-6 text-violet-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">
							{job.aiExperienceLevel ?? "Professional"} {job.title}
						</p>
						<p className="text-muted-foreground text-xs">Interview Prep Plan</p>
					</div>
				</div>
				<div className="space-y-2">
					{[
						{ week: "Week 1", topic: "Technical Foundations", done: false },
						{
							week: "Week 2",
							topic: job.aiKeySkills?.[0] ?? "Core Skills",
							done: false,
						},
						{ week: "Week 3", topic: "System Design", done: false },
					].map((item, i) => (
						<div key={item.week} className="flex items-center gap-2 text-xs">
							<div
								className={cn(
									"flex size-5 items-center justify-center rounded-full font-bold text-[10px]",
									i === 0
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground",
								)}
							>
								{i + 1}
							</div>
							<span className="font-medium">{item.week}:</span>
							<span className="text-muted-foreground">{item.topic}</span>
						</div>
					))}
				</div>
			</>
		),
	},
	{
		id: "resume-ai",
		trackingTitle: "YOUR RESUME KNOWS THE QUESTIONS",
		link: "https://www.interviewpal.com/resume-ai",
		cta: "Predict My Questions",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-emerald-100 to-teal-100">
						<Sparkles className="h-6 w-6 text-emerald-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">AI Question Predictor</p>
						<p className="text-muted-foreground text-xs">
							Based on {job.title} role
						</p>
					</div>
				</div>
				<div className="space-y-2">
					{[
						`Tell me about your experience with ${job.aiKeySkills?.[0] ?? "this role"}`,
						`Why do you want to work at ${job.organization}?`,
						"Describe a challenging project you've led",
					].map((question, i) => (
						<div
							key={question}
							className="flex items-start gap-2 rounded border border-border bg-muted/50 p-2 text-xs"
						>
							<FileQuestion className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
							<span className="line-clamp-1">{question}</span>
						</div>
					))}
				</div>
			</>
		),
	},
	{
		id: "interview-copilot",
		trackingTitle: "ACE YOUR INTERVIEW IN REAL-TIME",
		link: "https://www.interviewpal.com/interview-copilot",
		cta: "Try Interview Copilot",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-rose-100 to-pink-100">
						<Mic className="h-6 w-6 text-rose-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">Silent AI Co-Pilot</p>
						<p className="text-muted-foreground text-xs">
							Real-time interview help
						</p>
					</div>
				</div>
				<div className="relative overflow-hidden rounded-lg border border-border bg-linear-to-br from-slate-900 to-slate-800 p-3">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
							<span className="font-mono text-green-400 text-xs">
								Listening...
							</span>
						</div>
						<p className="font-mono text-slate-300 text-xs">
							"Why {job.organization}?"
						</p>
						<div className="rounded bg-slate-700/50 p-2">
							<p className="font-mono text-emerald-400 text-xs">
								💡 Mention their{" "}
								{job.linkedinOrgIndustry ?? "industry leadership"} and your
								passion for {job.aiKeySkills?.[0] ?? "the role"}
							</p>
						</div>
					</div>
				</div>
			</>
		),
	},
	{
		id: "interview-questions",
		trackingTitle: "20,000+ INTERVIEW QUESTIONS",
		link: "https://www.interviewpal.com/questions",
		cta: "Browse Questions",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-100 to-indigo-100">
						<BookOpen className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">Question Database</p>
						<p className="text-muted-foreground text-xs">
							Curated for {job.aiTaxonomiesA?.[0] ?? job.title}
						</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					{(
						job.aiTaxonomiesA ?? [
							"Technical",
							"Behavioral",
							"System Design",
							"Culture Fit",
						]
					)
						.slice(0, 4)
						.map((category) => (
							<div
								key={category}
								className="rounded border border-border bg-muted/50 p-2 text-center"
							>
								<p className="font-medium text-xs">{category}</p>
								<p className="text-[10px] text-muted-foreground">
									{Math.floor(Math.random() * 500 + 100)}+ Qs
								</p>
							</div>
						))}
				</div>
			</>
		),
	},
	{
		id: "practice-questions",
		trackingTitle: "STUCK ON A QUESTION? PRACTICE IT",
		link: "https://www.interviewpal.com/create-your-own-question",
		cta: "Start Practicing",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-cyan-100 to-sky-100">
						<MessageSquareText className="h-6 w-6 text-cyan-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">Practice Any Question</p>
						<p className="text-muted-foreground text-xs">
							Get instant AI feedback
						</p>
					</div>
				</div>
				<div className="space-y-2">
					<div className="rounded border border-border border-dashed bg-muted/50 p-3">
						<p className="text-muted-foreground text-xs italic">
							"How would you design a scalable system for {job.organization}'s
							use case?"
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Zap className="h-4 w-4 text-amber-500" />
						<span className="text-muted-foreground text-xs">
							Record your answer & get scored
						</span>
					</div>
				</div>
			</>
		),
	},
	{
		id: "cover-letter-templates",
		trackingTitle: "PROFESSIONAL COVER LETTER TEMPLATES",
		link: "https://www.interviewpal.com/cover-letters",
		cta: "View Templates",
		renderContent: (job) => (
			<>
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-slate-100 to-gray-100">
						<Layers className="h-6 w-6 text-slate-600" />
					</div>
					<div>
						<p className="font-semibold text-sm">Template Library</p>
						<p className="text-muted-foreground text-xs">
							{job.employmentType?.[0] ?? "Professional"} templates
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex-1 rounded border border-border bg-linear-to-b from-white to-muted p-2"
						>
							<div className="mb-1 h-1 w-full rounded bg-muted-foreground/20" />
							<div className="mb-1 h-1 w-3/4 rounded bg-muted-foreground/20" />
							<div className="mb-2 h-1 w-1/2 rounded bg-muted-foreground/20" />
							<div className="h-1 w-full rounded bg-muted-foreground/10" />
							<div className="mt-0.5 h-1 w-full rounded bg-muted-foreground/10" />
							<div className="mt-0.5 h-1 w-2/3 rounded bg-muted-foreground/10" />
						</div>
					))}
				</div>
				<p className="text-center text-muted-foreground text-xs">
					50+ templates for every role
				</p>
			</>
		),
	},
];

// Sidebar Component
function InterviewPalSidebar({ job }: { job: JobI }) {
	const selectedCards = useMemo(() => shuffleArray(TOOL_CARDS).slice(0, 3), []);

	return (
		<div className="sticky top-5 space-y-4">
			<p className="font-jet-brains-mono text-muted-foreground text-xs uppercase tracking-widest">
				Prep Tools
			</p>
			{selectedCards.map((config) => (
				<InterviewPalToolCard key={config.id} config={config} job={job} />
			))}
		</div>
	);
}

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
							<InterviewPalSidebar job={job} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
