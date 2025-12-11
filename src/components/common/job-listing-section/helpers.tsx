import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw } from "lucide-react";

export const JobsListingLoadingSkeleton = () => {
	return (
		<div className="mt-10 space-y-8">
			{Array.from({ length: 5 }, (_, index) => `skeleton-${index}`).map(
				(key) => (
					<Skeleton key={key} className="h-72 w-full rounded-lg" />
				),
			)}
		</div>
	);
};

export const JobsListingError = ({
	error,
	refetch,
}: { error: string; refetch: () => void }) => {
	return (
		<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-secondary p-12">
			<div className="text-center">
				<p className="mb-1.5 font-semibold text-xl">
					Oops! We're having trouble loading the jobs.
				</p>
				<p className="mb-4 text-muted-foreground">
					{error ?? "Something went wrong. Please try again."}
				</p>
				<Button
					onClick={() => refetch()}
					variant="outline"
					className="border-2 border-border! px-5 shadow-none"
				>
					<RotateCcw className="size-4" />
					Try Again
				</Button>
			</div>
		</div>
	);
};

export const JobsListingEmpty = ({ withFilters }: { withFilters: boolean }) => {
	return (
		<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-secondary p-12">
			<div className="text-center">
				<p className="mb-1.5 font-semibold text-xl">No jobs found</p>
				<p className="mb-4 text-muted-foreground">
					{withFilters
						? "Try adjusting your filters to see more results"
						: "Stay tuned, we'll be adding more jobs soon."}
				</p>
			</div>
		</div>
	);
};
