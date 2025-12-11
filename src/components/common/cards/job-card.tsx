import Link from "next/link";

import { AlertSubscriptionButton } from "@/components/common/alert-subscription-button";
import { Button } from "@/components/ui/button";
import { deriveAlertFromJob } from "@/lib/alert-helpers";
import type { JobCardI } from "@/lib/types";
import { cleanString, cn, getJobInfoItems } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export function JobCard({
	job,
}: {
	job: JobCardI;
}) {
	const { title, organization, datePosted, aiTaxonomiesA } = job;
	const {
		location,
		experienceLevel,
		salary,
		workingHours,
		jobLanguage,
		visaSponsorship,
		companySize,
		coreResponsibilities,
	} = getJobInfoItems(job);

	return (
		<div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-background p-6 drop-shadow md:flex-row md:gap-4">
			<div className="relative flex size-full flex-1 flex-col justify-between gap-4">
				<div className="space-y-2">
					<h3 className="font-semibold text-lg leading-tight">{title}</h3>
					<p className="text-muted-foreground text-sm">{organization}</p>
				</div>
				<dl className="-ml-3.5 grid grid-flow-row grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-y-0.5 text-sm capitalize">
					{[
						{ label: "Date Posted", value: formatDate(datePosted) },
						{ label: "Location", value: cleanString(location) },
						{ label: "Experience", value: experienceLevel },
						{ label: "Working Hours", value: workingHours },
						{ label: "Language", value: jobLanguage },
						{ label: "Visa Sponsorship", value: visaSponsorship },
						{ label: "Company Size", value: companySize },
						{ label: "Salary", value: salary, classNames: "col-span-2" },
					]
						.filter((item) => item.value)
						.map(({ label, value, classNames }) => (
							<div
								key={label}
								className={cn(
									"space-y-0.5 border-r px-4 py-2 last:border-r-0",
									classNames,
								)}
							>
								<dt className="font-semibold text-foreground text-xs">
									{label}
								</dt>
								<dd className="text-muted-foreground text-xs">{value}</dd>
							</div>
						))}
				</dl>
				{coreResponsibilities && (
					<div className="space-y-5">
						<span className="font-semibold text-foreground text-sm">
							Core Responsibilities
						</span>
						<p className="text-muted-foreground text-sm">
							{coreResponsibilities.length > 250
								? `${coreResponsibilities.slice(0, 250)}...`
								: coreResponsibilities}
						</p>
					</div>
				)}
				<div className="space-y-2.5">
					{aiTaxonomiesA && aiTaxonomiesA.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{aiTaxonomiesA.slice(0, 3).map((category) => (
								<span
									key={category}
									className="flex items-center rounded-sm border border-border bg-muted px-2 py-1 font-medium text-foreground text-xs"
								>
									{category}
								</span>
							))}
							{aiTaxonomiesA.length > 3 && (
								<span className="flex items-center rounded-sm border border-border bg-white px-3 py-1.5 font-medium text-foreground text-sm">
									+{aiTaxonomiesA.length - 3} more
								</span>
							)}
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2 max-sm:w-full">
				<AlertSubscriptionButton
					alertData={deriveAlertFromJob(job)}
					className="rounded-sm max-sm:w-full!"
				>
					Save for Alerts
				</AlertSubscriptionButton>
				<Link href={`/jobs/${job.id}`}>
					<Button className="rounded-sm bg-primary text-background hover:bg-primary/90 max-sm:w-full!">
						View Job Post
					</Button>
				</Link>
			</div>
		</div>
	);
}
