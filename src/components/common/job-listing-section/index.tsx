"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import { api } from "@/trpc/react";
import { Wrapper } from "@/wrappers";

import { JobCard } from "@/common/cards/job-card";
import type { JobCardI } from "@/lib/types";
import {
	buildURLParams,
	cn,
	groupJobsByTime,
	parseFiltersFromURL,
} from "@/lib/utils";
import { PagePagination } from "../page-pagination";
import { JobListingFilters } from "./filters";
import {
	JobsListingEmpty,
	JobsListingError,
	JobsListingLoadingSkeleton,
} from "./helpers";

const filterSchema = z.object({
	searchQuery: z.string().optional(),
	location: z.string().optional(),
	remote: z.boolean().optional(),
	categories: z.array(z.string()).optional(),
});

export type FilterFormValues = z.infer<typeof filterSchema>;

export function JobListingSection({
	title = "Latest job posts",
	withPagination = true,
	withFilters = true,
	withCategories = true,
	className,
	initialFilters,
}: {
	title?: string;
	withPagination?: boolean;
	className?: string;
	withFilters?: boolean;
	withCategories?: boolean;
	initialFilters?: Partial<FilterFormValues>;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Parse page from URL or default to 1
	const urlPage = Number.parseInt(searchParams.get("page") || "1", 10);
	const [page, setPage] = useState(urlPage);

	// Parse initial filters from URL or props
	const urlFilters = useMemo(
		() => parseFiltersFromURL(searchParams),
		[searchParams],
	);

	const defaultValues = useMemo(
		() => ({
			searchQuery: initialFilters?.searchQuery || urlFilters.searchQuery || "",
			location: initialFilters?.location || urlFilters.location || "",
			remote: initialFilters?.remote ?? urlFilters.remote ?? false,
			categories: initialFilters?.categories || urlFilters.categories || [],
		}),
		[initialFilters, urlFilters],
	);

	const form = useForm<FilterFormValues>({
		resolver: zodResolver(filterSchema),
		defaultValues,
	});

	const watchedFilters = form.watch();

	// Memoize filters to prevent unnecessary query refetches
	const filters = useMemo(
		() => ({
			searchQuery: watchedFilters.searchQuery || undefined,
			location: watchedFilters.location || undefined,
			remote: watchedFilters.remote || undefined,
			categories:
				watchedFilters.categories && watchedFilters.categories.length > 0
					? watchedFilters.categories
					: undefined,
		}),
		[
			watchedFilters.searchQuery,
			watchedFilters.location,
			watchedFilters.remote,
			watchedFilters.categories,
		],
	);

	// Sync URL when filters or page change (debounced to prevent excessive updates)
	const urlSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	useEffect(() => {
		if (urlSyncTimeoutRef.current) {
			clearTimeout(urlSyncTimeoutRef.current);
		}
		urlSyncTimeoutRef.current = setTimeout(() => {
			const params = buildURLParams(watchedFilters, page);
			const newUrl = params.toString()
				? `${window.location.pathname}?${params.toString()}`
				: window.location.pathname;
			const currentUrl = window.location.pathname + window.location.search;
			if (newUrl !== currentUrl) {
				router.replace(newUrl, { scroll: false });
			}
		}, 100);

		return () => {
			if (urlSyncTimeoutRef.current) {
				clearTimeout(urlSyncTimeoutRef.current);
			}
		};
	}, [watchedFilters, page, router]);

	// Reset page when filters change
	const prevFiltersRef = useRef(watchedFilters);
	useEffect(() => {
		const prev = prevFiltersRef.current;
		const prevCategoriesStr = JSON.stringify(prev.categories || []);
		const currCategoriesStr = JSON.stringify(watchedFilters.categories || []);
		const hasChanged =
			prev.searchQuery !== watchedFilters.searchQuery ||
			prev.location !== watchedFilters.location ||
			prev.remote !== watchedFilters.remote ||
			prevCategoriesStr !== currCategoriesStr;
		if (hasChanged) {
			setPage(1);
			prevFiltersRef.current = watchedFilters;
		}
	}, [watchedFilters]);

	const { data, isLoading, error, refetch } = api.jobs.getJobs.useQuery(
		{
			page,
			limit: 20,
			filters,
		},
		{
			staleTime: 60 * 1000, // 1 minute - jobs don't change that frequently
			refetchOnMount: false, // Don't refetch on mount if data is fresh
			refetchOnWindowFocus: false, // Don't refetch on window focus
			refetchOnReconnect: true, // Only refetch on reconnect
		},
	);

	const handleReset = () => {
		if (withCategories === false) {
			const currentCategories = form.getValues("categories");
			form.reset();
			form.setValue("categories", currentCategories);
		} else {
			form.reset();
		}
		setPage(1);
	};

	const handlePageChange = useMemo(
		() => (newPage: number | ((prev: number) => number)) => {
			setPage(newPage);
			// Scroll to top of section after state update
			setTimeout(() => {
				const section = document.getElementById("featured-jobs");
				if (section) {
					section.scrollIntoView({ behavior: "smooth", block: "start" });
				} else {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}
			}, 0);
		},
		[],
	);

	const groupedJobs = useMemo(
		() =>
			data?.jobs && data.jobs.length > 0
				? groupJobsByTime(data.jobs)
				: new Map<string, JobCardI[]>(),
		[data?.jobs],
	);

	const hasActiveFilters = useMemo(
		() =>
			!!(
				watchedFilters.searchQuery ||
				watchedFilters.location ||
				watchedFilters.remote ||
				(watchedFilters.categories && watchedFilters.categories.length > 0)
			),
		[
			watchedFilters.searchQuery,
			watchedFilters.location,
			watchedFilters.remote,
			watchedFilters.categories,
		],
	);

	const shouldShowJobs = !isLoading && !error && data && data.jobs.length > 0;
	const shouldShowPagination = withPagination && shouldShowJobs;

	const colors = [
		{
			text: "text-primary",
			background: "bg-primary",
			border: "border-primary",
		},
		{
			text: "text-destructive",
			background: "bg-destructive",
			border: "border-destructive",
		},
		{
			text: "text-secondary-foreground",
			background: "bg-secondary-foreground",
			border: "border-secondary-foreground",
		},
		{
			text: "text-muted-foreground",
			background: "bg-muted-foreground",
			border: "border-muted-foreground",
		},
	];

	return (
		<Wrapper
			className={cn(
				"max-w-sub-container space-y-4 border-border border-x-2 bg-background px-content-sm pb-content-lg",
				className,
			)}
			id="featured-jobs"
		>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-heading-h2">{title}</h2>
					{withFilters && hasActiveFilters && (
						<Button
							variant="secondary"
							size="sm"
							className="border-2 border-border! px-5 shadow-none"
							onClick={handleReset}
							type="button"
						>
							<RotateCcw className="size-4" />
							Clear all filters
						</Button>
					)}
				</div>
				{withFilters && (
					<JobListingFilters form={form} withCategories={withCategories} />
				)}
			</div>
			{isLoading && <JobsListingLoadingSkeleton />}
			{error && <JobsListingError error={error.message} refetch={refetch} />}
			{data && data.jobs.length === 0 && (
				<JobsListingEmpty withFilters={withFilters} />
			)}
			{shouldShowJobs && (
				<div className="space-y-8">
					{Array.from(groupedJobs.entries()).map(([timeCategory, jobs]) => (
						<div key={timeCategory} className="space-y-4">
							{(() => {
								const color = colors[Math.floor(Math.random() * colors.length)];
								return (
									<div className="flex items-center gap-5 font-semibold text-xs uppercase tracking-wide">
										<span className={cn(color?.text ?? "")}>
											{timeCategory}
										</span>
										<div
											className={cn(
												"w-full flex-1 border-t-3 border-dashed",
												color?.border,
											)}
										/>
									</div>
								);
							})()}
							<div className="space-y-3">
								{jobs.map((job) => (
									<JobCard key={job.id} job={job} />
								))}
							</div>
						</div>
					))}
				</div>
			)}
			{shouldShowPagination && (
				<PagePagination
					currentPage={page}
					setCurrentPage={handlePageChange}
					totalPages={data?.totalPages || 1}
				/>
			)}
		</Wrapper>
	);
}
