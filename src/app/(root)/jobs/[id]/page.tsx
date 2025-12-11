import { JobDetailClient } from "@/components/common/job-detail-client";
import { JobStructuredData } from "@/components/common/job-structured-data";
import { PageWrapper, Wrapper } from "@/components/wrappers";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{
		id: string;
	}>;
}) {
	const { id } = await params;
	const job = await api.jobs.getJobDetails({ jobId: id });

	if (!job) {
		return redirect("/not-found");
	}

	return (
		<PageWrapper showFooter={true}>
			<Wrapper className="border-lines">
				<JobStructuredData job={job} />
				<JobDetailClient job={job} />
			</Wrapper>
		</PageWrapper>
	);
}
