"use client";

import { BlogCard } from "@/common/cards/blog-card";
import { PagePagination } from "@/common/page-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleWrapper } from "@/components/wrappers";
import type { PostT } from "@/lib/types";
import { api } from "@/trpc/react";
import React, { useState } from "react";

export const BlogView = ({ page }: { page: number }) => {
	const postsPerPage = 9;
	const [currentPage, setCurrentPage] = useState(page);

	const { data, isLoading, error } = api.blog.getPosts.useQuery({
		page: currentPage,
		limit: postsPerPage,
	});

	if (error) {
		return (
			<div>
				<div className="py-12 text-center">
					<h1 className="mb-4 font-bold text-4xl text-gray-900">Blog</h1>
					<p className="mb-8 text-red-600">
						Error loading blog posts. Please try again later.
					</p>
					<Button onClick={() => window.location.reload()}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<TitleWrapper
			className="space-y-6 py-12"
			title="InternshipsHQ Latest Blog Posts"
			para="Stay updated with the latest insights on job search, career development, and interview preparation."
		>
			{isLoading && (
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 9 }).map((_) => (
						<div key={new Date().getTime()} className="space-y-4">
							<Skeleton className="h-64 w-full rounded-lg" />
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-4 w-1/3" />
								</div>
								<Skeleton className="mt-8 h-12 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						</div>
					))}
				</div>
			)}
			{data && !isLoading && (
				<React.Fragment>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{data.posts.map((post: PostT) => (
							<BlogCard key={post.id} post={post} />
						))}
					</div>
					<div className="pt-5">
						<PagePagination
							className="py-0!"
							currentPage={currentPage}
							totalPages={data.pagination.pages}
							setCurrentPage={setCurrentPage}
						/>
					</div>
				</React.Fragment>
			)}
			{data && data.posts.length === 0 && !isLoading && (
				<div className="py-16 text-center">
					<h2 className="mb-4 font-semibold text-2xl text-gray-900">
						No posts found
					</h2>
					<p className="text-gray-600">Check back later for new content!</p>
				</div>
			)}
		</TitleWrapper>
	);
};
