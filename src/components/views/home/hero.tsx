import { Button } from "@/components/ui/button";
import { Wrapper } from "@/components/wrappers";
import { api } from "@/trpc/server";
import Link from "next/link";

export const Hero = async () => {
	const { total } = await api.jobs.getJobsStats();

	return (
		<Wrapper className="max-w-sub-container overflow-hidden border-x-2 bg-background pt-content">
			<div
				className="relative size-full bg-no-repeat max-sm:bg-center max-sm:bg-cover sm:ml-6"
				style={{
					backgroundImage: "url('/assets/home/bgHero.webp')",
				}}
			>
				<div className="max-w-para-xl space-y-6 py-8 pt-48 text-center sm:ml-6 lg:ml-12">
					<h1 className="font-extrabold text-foreground text-heading-h1 tracking-tight">
						Jobs posted today. <br />
						Not last week.
					</h1>
					<p className="mx-auto max-w-para-lg text-foreground/80 text-paragraph-section">
						We scan hiring sources most job seekers never check and surface
						openings the moment they go live. Skip stale listings and get early
						access to real roles from tech startups, fast-growing companies, and
						hidden job sources you won’t find on public boards
					</p>
					<div className="flex flex-wrap items-center justify-center gap-2">
						<Button size="lg" asChild>
							<Link href="/jobs">Browse Latest Jobs</Link>
						</Button>
						<Button variant="secondary" size="lg" asChild>
							<Link href="#subscribe-form">Get New Job Alerts</Link>
						</Button>
					</div>
					<div className="space-y-1">
						<p className="font-medium text-primary">
							{total.toLocaleString()} new jobs added today
						</p>
						<div className="flex items-center justify-center text-muted-foreground/60 text-xs">
							<div className="size-8">
								<iframe
									title="Live Icon"
									src="https://lottie.host/embed/a2a02966-90f0-445b-8d93-87e825ca7bcc/p6xnqjp0A3.lottie"
									width="100%"
									height="100%"
								/>
							</div>
							Updated about 4 minutes ago
						</div>
					</div>
				</div>
			</div>
		</Wrapper>
	);
};
