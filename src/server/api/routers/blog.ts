import type { BlogPostsResponseT, PostT } from "@/lib/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const blogRouter = createTRPCRouter({
	getPost: publicProcedure
		.input(
			z.object({
				slug: z.string().min(1, "Slug is required"),
			}),
		)
		.query(async ({ input }: { input: { slug: string } }) => {
			const { slug } = input;

			const res = await fetch(
				`${process.env.GHOST_URL}/ghost/api/content/posts/slug/${slug}/?key=${process.env.GHOST_CONTENT_API_KEY}&include=tags,authors`,
			);
			const data = (await res.json()) as { posts: PostT[] };
			return data.posts[0];
		}),
	getPosts: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(50).default(9),
			}),
		)
		.query(async ({ input }: { input: { page: number; limit: number } }) => {
			const { page, limit } = input;
			try {
				const response = await fetch(
					`${process.env.GHOST_URL}/ghost/api/content/posts/?key=${process.env.GHOST_CONTENT_API_KEY}&include=tags,authors&limit=${limit}&page=${page}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						next: {
							revalidate: 60 * 10,
						},
					},
				);
				if (!response.ok) {
					throw new Error(`Error fetching posts: ${response.statusText}`);
				}

				const data = (await response.json()) as {
					posts: PostT[];
					meta: {
						pagination: {
							limit: number;
							next: number | null;
							page: number;
							pages: number;
							prev: number | null;
							total: number;
						};
					};
				};
				return {
					posts: data.posts,
					pagination: data.meta.pagination,
				} as BlogPostsResponseT;
			} catch (error) {
				console.error("Error fetching posts:", error);
				throw new Error("Failed to fetch posts");
			}
		}),
});
