import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { PostT } from "@/lib/types";
import {
	cn,
	formatBlogDate,
	getBlogAuthorImage,
	getBlogAuthorName,
	getBlogExcerpt,
} from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const BlogCard = ({
	post,
	className,
}: {
	post: PostT;
	className?: string;
}) => {
	return (
		<Card
			className={cn(
				"group flex h-full flex-col overflow-hidden p-0 pb-6 transition-all duration-300 hover:shadow-lg",
				className,
			)}
		>
			<Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
				{post.feature_image && (
					<div className="relative h-60 w-full overflow-hidden">
						<Image
							src={post.feature_image}
							alt={post.title}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
				)}
				<CardHeader className="space-y-3 p-6">
					{post.tags && post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{post.tags.slice(0, 3).map((tag) => (
								<span
									key={tag.id}
									className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground text-xs"
								>
									{tag.name}
								</span>
							))}
						</div>
					)}
					<CardTitle className="line-clamp-2 font-semibold text-lg leading-tight group-hover:text-primary">
						{post.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex-1">
					<CardDescription className="line-clamp-3 text-sm leading-relaxed">
						{getBlogExcerpt(post)}
					</CardDescription>
				</CardContent>
			</Link>
			<CardFooter className="mt-auto flex items-center justify-between text-sm">
				<div className="flex items-center gap-2">
					{getBlogAuthorImage(post) && (
						<div className="relative h-6 w-6 overflow-hidden rounded-full">
							<Image
								src={getBlogAuthorImage(post) ?? ""}
								alt={getBlogAuthorName(post)}
								fill
								className="object-cover"
							/>
						</div>
					)}
					<div className="flex items-center gap-1 text-xs">
						<span>{getBlogAuthorName(post)}</span>
					</div>
				</div>
				<div className="flex items-center gap-1 text-xs">
					<span>{formatBlogDate(post.published_at)}</span>
				</div>
			</CardFooter>
		</Card>
	);
};
