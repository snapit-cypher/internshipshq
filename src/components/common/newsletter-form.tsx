"use client";

import Image from "next/image";
import mailIcon from "public/icons/mail.png";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";
import { useSystem } from "@/hooks/use-system";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Wrapper } from "../wrappers";

export const NewsletterForm = () => {
	const [email, setEmail] = useState("");
	const [categories, setCategories] = useState<string[]>([]);
	const { jobCategories } = useSystem();

	const availableCategories = useMemo(
		() => jobCategories.map((cat) => cat.category),
		[jobCategories],
	);

	const subscribe = api.email.subscribe.useMutation({
		onSuccess: (data) => {
			toast.success(data.message);
			setEmail("");
			setCategories([]);
		},
		onError: () => {
			toast.error("Failed to subscribe. Please try again.");
		},
	});

	const handleCategoriesChange = (newCategories: string[]) => {
		// Limit to max 2 categories
		if (newCategories.length <= 2) {
			setCategories(newCategories);
		} else {
			toast.error("You can select a maximum of 2 categories");
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email) {
			toast.error("Please enter your email address");
			return;
		}
		if (categories.length === 0) {
			toast.error("Please select at least one category");
			return;
		}
		subscribe.mutate({ email, categories });
	};

	return (
		<Wrapper className="max-w-sub-container border-x-2 bg-background px-content-sm py-10">
			<Card className="rounded-lg bg-background p-6" id="subscribe-form">
				<CardContent className="p-0">
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col items-center justify-between gap-6 md:flex-row md:justify-between lg:gap-8">
							<div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-0">
								<div className="shrink-0">
									<Image
										src={mailIcon}
										alt="Email icon"
										width={100}
										height={100}
										className="-mt-4 h-20 w-20 mix-blend-multiply"
									/>
								</div>
								<div className="space-y-2 md:space-y-1">
									<h3 className="font-bold text-heading-h5">
										Get Real-Time Job Alerts For Free
									</h3>
									<p className="text-muted-foreground text-paragraph-section">
										Jobs updated every minute. Get notified for free when new
										roles matching your interests go live.
									</p>
								</div>
							</div>
							<div className="flex w-full flex-col gap-3 md:w-1/2">
								<div className="grid grid-cols-2 gap-2">
									<Input
										type="email"
										placeholder="Your email address"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className={cn(
											"w-full bg-background px-4",
											subscribe.isError && "border-destructive",
										)}
										disabled={subscribe.isPending}
									/>
									<MultiSelect
										values={categories}
										onValuesChange={handleCategoriesChange}
									>
										<MultiSelectTrigger
											className={cn(
												"w-full border-border bg-background",
												subscribe.isError && "border-destructive",
											)}
											disabled={subscribe.isPending}
										>
											<MultiSelectValue placeholder="Select categories (max 2)" />
										</MultiSelectTrigger>
										<MultiSelectContent>
											{availableCategories.length > 0 ? (
												availableCategories.map((category) => (
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
								</div>
								<Button
									type="submit"
									size="lg"
									disabled={subscribe.isPending}
									className="h-10 whitespace-nowrap md:min-w-[150px]"
								>
									{subscribe.isPending ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										"Get Alerts for Free"
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</Wrapper>
	);
};
