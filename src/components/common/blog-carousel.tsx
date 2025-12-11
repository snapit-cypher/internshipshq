"use client";

import { BlogCard } from "@/common/cards/blog-card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { PostT } from "@/lib/types";
import { cn } from "@/lib/utils";

export const BlogCarousel = ({
	posts,
	className,
}: {
	posts: PostT[];
	className?: string;
}) => {
	if (!posts || posts.length === 0) {
		return null;
	}

	return (
		<div className={cn("mx-auto w-[calc(100%-5rem)]", className)}>
			<Carousel
				opts={{
					align: "start",
					loop: true,
				}}
				className="w-full"
			>
				<CarouselContent className="-ml-2 md:-ml-4">
					{posts.map((post) => (
						<CarouselItem
							key={post.id}
							className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
						>
							<BlogCard post={post} />
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="-left-10 hidden md:flex" />
				<CarouselNext className="-right-10 hidden md:flex" />
			</Carousel>
		</div>
	);
};
