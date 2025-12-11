import type React from "react";
import { useCallback } from "react";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export const PagePagination = ({
	currentPage,
	setCurrentPage,
	totalPages,
	maxVisiblePages = 5,
	className,
}: {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	totalPages: number;
	maxVisiblePages?: number;
	className?: string;
}) => {
	const changePage = useCallback(
		(page: number) => setCurrentPage(page),
		[setCurrentPage],
	);

	const startPage = Math.max(
		Math.min(
			currentPage - Math.floor(maxVisiblePages / 2),
			totalPages - maxVisiblePages + 1,
		),
		1,
	);
	const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

	return (
		<Pagination className={cn("py-content-sm", className)}>
			<PaginationContent className="gap-2">
				<PaginationItem>
					<PaginationPrevious
						onClick={() => {
							if (currentPage > 1) changePage(currentPage - 1);
						}}
						aria-disabled={currentPage === 1}
						className={
							currentPage === 1 ? "pointer-events-none opacity-50" : ""
						}
					/>
				</PaginationItem>

				{/* Mobile Pagination */}
				<div className="flex md:hidden">
					<PaginationItem>
						<PaginationLink
							onClick={() => changePage(currentPage)}
							isActive={true}
						>
							{currentPage}
						</PaginationLink>
					</PaginationItem>
				</div>

				{/* Desktop Pagination */}
				<div className="hidden flex-wrap items-center gap-2 md:flex">
					{startPage > 1 && (
						<PaginationItem>
							<PaginationLink onClick={() => changePage(1)}>1</PaginationLink>
						</PaginationItem>
					)}

					{startPage > 2 && (
						<PaginationItem>
							<PaginationLink
								onClick={() => {}}
								isActive={false}
								className="pointer-events-none"
							>
								...
							</PaginationLink>
						</PaginationItem>
					)}

					{Array.from(
						{ length: endPage - startPage + 1 },
						(_, index) => startPage + index,
					).map((page) => (
						<PaginationItem key={page}>
							<PaginationLink
								onClick={() => changePage(page)}
								isActive={currentPage === page}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					))}

					{endPage < totalPages - 1 && (
						<PaginationItem>
							<PaginationLink
								onClick={() => {}}
								isActive={false}
								className="pointer-events-none"
							>
								...
							</PaginationLink>
						</PaginationItem>
					)}

					{endPage < totalPages && (
						<PaginationItem>
							<PaginationLink onClick={() => changePage(totalPages)}>
								{totalPages}
							</PaginationLink>
						</PaginationItem>
					)}
				</div>

				<PaginationItem>
					<PaginationNext
						onClick={() => {
							if (currentPage < totalPages) changePage(currentPage + 1);
						}}
						aria-disabled={currentPage === totalPages}
						className={
							currentPage === totalPages ? "pointer-events-none opacity-50" : ""
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};
