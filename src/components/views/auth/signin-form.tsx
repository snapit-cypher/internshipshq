"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signinSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export function SigninForm({
	onSuccess,
}: {
	onSuccess?: () => void;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<SigninFormValues>({
		resolver: zodResolver(signinSchema),
		defaultValues: {
			email: searchParams.get("email") ?? "",
			password: "",
		},
	});

	const onSubmit = async (data: SigninFormValues) => {
		try {
			setIsLoading(true);
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				toast.error(result.error);
				return;
			}

			toast.success("Signed in successfully!");
			onSuccess?.();

			// Redirect to home or callback URL
			const callbackUrl = searchParams.get("callbackUrl") ?? "/";
			router.push(callbackUrl);
			router.refresh();
		} catch (error) {
			toast.error("An error occurred during sign in");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Your email address</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="you@example.com"
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										disabled={isLoading}
										{...field}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Signing in..." : "Login to your account"}
				</Button>
			</form>
		</Form>
	);
}
