import { BlogView } from "@/common/blog-view";
import { BottomCta } from "@/components/common/bottom-cta";
import { PageWrapper, Wrapper } from "@/components/wrappers";
import { HydrateClient, api } from "@/trpc/server";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	const params = await searchParams;
	const page = Number(params.page ?? "1");

	await api.blog.getPosts.prefetch({
		page: page,
		limit: 9,
	});

	return (
		<PageWrapper>
			<HydrateClient>
				<Wrapper className="border-lines">
					<BlogView page={page} />
					<BottomCta />
				</Wrapper>
			</HydrateClient>
		</PageWrapper>
	);
}
