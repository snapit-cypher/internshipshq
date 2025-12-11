"use client";

import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button, type buttonVariants } from "@/components/ui/button";
import { useSystem } from "@/hooks/use-system";
import { api } from "@/trpc/react";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";

interface AlertSubscriptionButtonProps
	extends React.ComponentPropsWithoutRef<"button">,
		VariantProps<typeof buttonVariants> {
	alertData: {
		name: string;
		locations?: string[];
		categories?: string[];
		remoteOnly?: boolean;
	};
}

export function AlertSubscriptionButton({
	alertData,
	variant = "secondary",
	size = "default",
	className,
	...props
}: AlertSubscriptionButtonProps) {
	const router = useRouter();
	const { user } = useSystem();
	const createAlert = api.alerts.create.useMutation();

	const handleClick = async () => {
		if (!user) {
			router.push("/auth/signup");
			return;
		}

		try {
			await createAlert.mutateAsync(alertData);
			toast.success("Alert saved! You'll be notified of similar jobs.");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save alert",
			);
		}
	};

	return (
		<Button
			onClick={handleClick}
			variant={variant}
			size={size}
			className={className}
			disabled={createAlert.isPending}
			{...props}
		>
			{createAlert.isPending ? (
				<>
					<Loader2 className="mr-2 size-4 animate-spin" />
					Saving...
				</>
			) : (
				<>
					<Bell className="mr-2 size-4" />
					Save Alert for Similar Internships
				</>
			)}
		</Button>
	);
}
