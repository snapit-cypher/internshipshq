import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSystem } from "@/hooks/use-system";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React, { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FilterFormValues } from ".";

export const JobListingFilters = ({
	form,
	withCategories = true,
}: {
	withCategories?: boolean;
	form: UseFormReturn<FilterFormValues>;
}) => {
	const { jobCategories } = useSystem();

	const categories = useMemo(
		() => jobCategories.map((cat) => cat.category),
		[jobCategories],
	);

	return (
		<React.Fragment>
			<Form {...form}>
				<div className="flex flex-1 gap-2">
					<FormField
						control={form.control}
						name="searchQuery"
						render={({ field }) => (
							<FormItem className="flex-1">
								<div className="relative">
									<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
									<FormControl>
										<Input
											placeholder="Search for a job or a company..."
											className="h-10 border-border pl-10"
											{...field}
										/>
									</FormControl>
								</div>
							</FormItem>
						)}
					/>
					<Button
						variant="outline"
						size="icon"
						type="button"
						className="h-10 border-2 border-border! px-5 shadow-none"
					>
						<Search className="size-4" />
					</Button>
				</div>
			</Form>
			<Form {...form}>
				<div
					className={cn(
						"grid items-center gap-4 rounded-lg",
						"border border-border p-4 md:grid-cols-3",
						!withCategories && "md:grid-cols-2",
					)}
				>
					<FormField
						control={form.control}
						name="location"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Location</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g. San Francisco"
										className="border-border"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					{withCategories && (
						<FormField
							control={form.control}
							name="categories"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Categories</FormLabel>
									<FormControl>
										<MultiSelect
											values={field.value || []}
											onValuesChange={field.onChange}
										>
											<MultiSelectTrigger className="w-full border-border">
												<MultiSelectValue placeholder="All Categories" />
											</MultiSelectTrigger>
											<MultiSelectContent>
												{categories.length > 0 ? (
													categories.map((category) => (
														<MultiSelectItem key={category} value={category}>
															{category}
														</MultiSelectItem>
													))
												) : (
													<div className="px-2 py-1.5 text-muted-foreground text-sm">
														No categories available
													</div>
												)}
											</MultiSelectContent>
										</MultiSelect>
									</FormControl>
								</FormItem>
							)}
						/>
					)}
					<FormField
						control={form.control}
						name="remote"
						render={({ field }) => (
							<FormItem>
								<FormLabel> Location</FormLabel>
								<Select
									value={field.value ? "true" : "false"}
									onValueChange={(value) => field.onChange(value === "true")}
								>
									<FormControl>
										<SelectTrigger className="w-full border-border">
											<SelectValue placeholder="All" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="false">All</SelectItem>
										<SelectItem value="true">Remote</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
				</div>
			</Form>
		</React.Fragment>
	);
};
