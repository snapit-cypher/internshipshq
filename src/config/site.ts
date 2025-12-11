import { staticPages } from "@/config/static-pages";
import type { FaqItem } from "@/lib/types";

export const siteConfig = {
	name: "InternshipsHQ - Fresh Jobs Updated Every Minute | Find Real, Verified Roles First",
	description:
		"InternshipsHQ scans thousands of hiring sources every minute so you see real, fresh openings before most job seekers.",
	mainNav: [
		{
			id: 0,
			title: "Jobs",
			href: "/jobs",
			type: "link",
			pages: [],
			group: "Company",
			forHeader: true,
			forFooter: false,
		},
		{
			id: 1,
			title: "Featured Jobs",
			href: "/#featured-jobs",
			type: "link",
			pages: [],
			group: "Company",
			forHeader: true,
			forFooter: false,
		},
		{
			id: 2,
			title: "Job Categories",
			href: "",
			type: "dropdown",
			pages: Object.entries(staticPages)
				.filter(([_, page]) => !("curated" in page && page.curated === true))
				.map(([key, page]) => ({
					label: page.title,
					link: `/${key}/jobs`,
					type: "link" as const,
					badge: null,
					disabled: false,
				})),
			group: "Company",
			forHeader: true,
			forFooter: true,
		},
		{
			id: 3,
			title: "Resources",
			href: "",
			type: "dropdown",
			pages: [
				{
					label: "Blog",
					link: "/blog",
					type: "link",
					badge: null,
					disabled: false,
				},
				{
					label: "Free Resume Generator",
					link: "#",
					type: "link",
					badge: "Coming Soon",
					disabled: true,
				},
			],
			group: "Company",
			forHeader: true,
			forFooter: false,
		},
		{
			id: 4,
			title: "Features",
			href: "/#features",
			type: "link",
			pages: [],
			group: "Company",
			forHeader: false,
			forFooter: true,
		},
		{
			id: 5,
			title: "Contact",
			href: "mailto:support@internshipshq.com",
			type: "email",
			pages: [],
			group: "Company",
			forHeader: false,
			forFooter: true,
		},
		{
			id: 6,
			title: "Blog",
			href: "/blog",
			type: "link",
			pages: [],
			group: "Company",
			forHeader: false,
			forFooter: true,
		},
		{
			id: 7,
			title: "Privacy Policy",
			href: "/privacy",
			type: "link",
			group: "Legal",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 8,
			title: "Terms & Conditions",
			href: "/terms",
			type: "link",
			group: "Legal",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 9,
			title: "Software Engineer Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 10,
			title: "Data Analyst Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 11,
			title: "Cybersecurity Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 12,
			title: "IT Support Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 13,
			title: "Marketing Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 14,
			title: "Remote Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 15,
			title: "Entry-Level Jobs",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
		{
			id: 16,
			title: "Trending Roles",
			href: "/jobs",
			type: "link",
			group: "Browse Jobs",
			pages: [],
			forHeader: false,
			forFooter: true,
		},
	],
	siteContent: {
		faqs: [
			{
				question: "How often are new jobs added?",
				content: [
					{
						type: "paragraph",
						text: "Every minute. We scan thousands of hiring sources in real-time so you see roles as soon as they go live, often hours before they appear on public job boards.Early access = higher odds of getting interviewed.",
					},
				],
			},
			{
				question: "Why can I only view limited per day on the free plan?",
				content: [
					{
						type: "paragraph",
						text: "Free access gives everyone a fair starting point. But seeing every job instantly creates an unfair advantage, so unlimited browsing is reserved for Pro users who want full access to fresh, hidden, and time-sensitive roles.",
					},
					{
						type: "paragraph",
						text: "Limiting free browsing also prevents automated scraping by competitors.",
					},
				],
			},
			{
				question: "What sources do you pull jobs from?",
				content: [
					{
						type: "paragraph",
						text: "We aggregate from:",
					},
					{
						type: "list",
						items: [
							"company career pages",
							"startup platforms",
							"ATS systems (Greenhouse, Lever, Ashby, Workable, etc.)",
							"niche regional job boards",
							"hidden talent networks not indexed by Google",
						],
					},
					{
						type: "paragraph",
						text: "Over 50,000 sources → one unified feed.",
					},
				],
			},
			{
				question: "Are these jobs legitimate?",
				content: [
					{
						type: "paragraph",
						text: "Yes. We automatically remove:",
					},
					{
						type: "list",
						items: [
							"expired listings",
							"spam",
							"shady postings",
							"duplicates",
							'fake "ghost jobs"',
						],
					},
					{
						type: "paragraph",
						text: "Every job you see is active, real, and verified at the source.",
					},
				],
			},
			{
				question: "What’s the benefit of upgrading to Pro?",
				content: [
					{
						type: "paragraph",
						text: "Pro gives you an information advantage. You unlock:",
					},
					{
						type: "list",
						items: [
							"unlimited job browsing",
							"real-time alerts for your saved filters",
							"early access to newly discovered roles",
							"deeper filtering (salary, remote, visa, experience, etc.)",
							"access to hidden sources most job seekers never find",
						],
					},
					{
						type: "paragraph",
						text: "Pro users consistently apply earlier and get significantly higher interview rates.",
					},
				],
			},
			{
				question: "Can I filter by location, experience, remote, or salary?",
				content: [
					{
						type: "paragraph",
						text: "Yes and Pro unlocks the power filters job boards don’t show you, including:",
					},
					{
						type: "list",
						items: [
							"roles posted in the last 24 hours",
							"company ATS only",
							"startup-only sources",
							"remote-flex categories",
							"international roles by timezone",
						],
					},
				],
			},
			{
				question: "Why are early alerts so important?",
				content: [
					{
						type: "paragraph",
						text: "Most job applications pile up within the first 6–12 hours after posting. If you apply early, you skip the crowd and rank higher in recruiter screening.",
					},
					{
						type: "paragraph",
						text: "Our alerts give you that timing advantage.",
					},
				],
			},
			{
				question: "Do you show salary?",
				content: [
					{
						type: "paragraph",
						text: "If the employer provides it, yes.",
					},
					{
						type: "paragraph",
						text: "If not, we attempt to estimate using salary bands from public and private datasets (Pro only).",
					},
				],
			},
			{
				question: "Is InternshipsHQ suitable for senior roles too?",
				content: [
					{
						type: "paragraph",
						text: "Yes.",
					},
					{
						type: "paragraph",
						text: "We cover all roles, from internships to senior-level. Filters simply let you tailor your feed to your level.",
					},
				],
			},
		] satisfies FaqItem[],
	},
};
