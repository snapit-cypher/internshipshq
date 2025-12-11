import { BlogCarousel } from "@/common/blog-carousel";
import { BottomCta } from "@/components/common/bottom-cta";
import { Button } from "@/components/ui/button";
import { PageWrapper, Wrapper } from "@/components/wrappers";
import {
	formatBlogDate,
	getBlogAuthorBio,
	getBlogAuthorImage,
	getBlogAuthorName,
	getReadingTime,
} from "@/lib/utils";
import { api } from "@/trpc/server";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const slug = (await params).slug;
	const post = await api.blog.getPost({ slug });

	return {
		title: {
			default: post?.title,
		},
		description: post?.excerpt,
		metadataBase: new URL(`${process.env.NEXT_PUBLIC_HOST_URL}/blog/${slug}`),
		alternates: {
			canonical: `${process.env.NEXT_PUBLIC_HOST_URL}/blog/${slug}`,
		},
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await api.blog.getPost({ slug });
	const { posts: relatedPosts } = await api.blog.getPosts({
		page: 1,
		limit: 6,
	});

	if (!post) {
		notFound();
	}

	return (
		<PageWrapper>
			<Wrapper className="border-lines">
				<div className="mx-auto max-w-sub-container border-x-2 bg-background px-content-sm! py-12 pb-content">
					<Link href="/blog">
						<Button variant="ghost" className="mb-5 flex items-center gap-2">
							<ArrowLeft className="h-4 w-4" />
							Back to Blog
						</Button>
					</Link>
					<header className="mb-8">
						{post.tags && post.tags.length > 0 && (
							<div className="mb-4 flex flex-wrap gap-2">
								{post.tags.map((tag) => (
									<span
										key={tag.id}
										className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
									>
										{tag.name}
									</span>
								))}
							</div>
						)}
						<h1 className="mb-6 font-bold text-4xl text-gray-900 leading-tight md:text-5xl">
							{post.title}
						</h1>
						{(post.custom_excerpt ?? post.excerpt) && (
							<p className="mb-6 text-gray-600 text-xl leading-relaxed">
								{post.custom_excerpt ?? post.excerpt}
							</p>
						)}
						<div className="mb-8 flex flex-wrap items-center gap-6 text-gray-600 text-sm">
							<div className="flex items-center gap-3">
								{getBlogAuthorImage(post) && (
									<div className="relative h-10 w-10 overflow-hidden rounded-full">
										<Image
											src={getBlogAuthorImage(post) ?? ""}
											alt={getBlogAuthorName(post)}
											fill
											className="object-cover"
										/>
									</div>
								)}
								<div>
									<div className="flex items-center gap-1">
										<User className="h-4 w-4" />
										<span className="font-medium">
											{getBlogAuthorName(post)}
										</span>
									</div>
									{getBlogAuthorBio(post) && (
										<p className="mt-1 text-gray-500 text-xs">
											{getBlogAuthorBio(post)}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								<span>{formatBlogDate(post.published_at)}</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span>{getReadingTime(post.html)} min read</span>
							</div>
						</div>
					</header>
					{post.feature_image && (
						<div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-[500px]">
							<Image
								src={post.feature_image}
								alt={post.title}
								fill
								className="object-cover"
								priority
							/>
						</div>
					)}
					<article className="mb-12 max-w-none">
						<div
							className="post-content"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{ __html: post.html }}
						/>
					</article>
					{getBlogAuthorBio(post) && (
						<div className="mb-12 border-gray-200 border-t pt-8">
							<div className="flex items-start gap-4">
								{getBlogAuthorImage(post) && (
									<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
										<Image
											src={getBlogAuthorImage(post) ?? ""}
											alt={getBlogAuthorName(post)}
											fill
											className="object-cover"
										/>
									</div>
								)}
								<div>
									<h3 className="mb-2 font-semibold text-gray-900 text-lg">
										About {getBlogAuthorName(post)}
									</h3>
									<p className="text-gray-600">{getBlogAuthorBio(post)}</p>
								</div>
							</div>
						</div>
					)}
					{relatedPosts && relatedPosts.length > 0 && (
						<section className="border-gray-200 border-t pt-12">
							<h2 className="mb-8 font-bold text-2xl text-foreground">
								Related Posts
							</h2>
							<BlogCarousel
								posts={relatedPosts
									.filter((relatedPost) => relatedPost.id !== post.id)
									.slice(0, 6)}
							/>
						</section>
					)}
				</div>
				<BottomCta />
			</Wrapper>
		</PageWrapper>
	);
}
