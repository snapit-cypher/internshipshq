"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	AuthContainer,
	AuthDivider,
	AuthFooter,
	AuthHeader,
	AuthStats,
	GoogleAuthButton,
	SignupForm,
} from "@/components/views/auth";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupModal() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);

	function onDismiss() {
		setIsOpen(false);
		router.back();
	}

	function handleSuccess() {
		onDismiss();
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
			<DialogContent className="min-h-fit! max-w-lg overflow-hidden rounded-md border-0 p-0">
				<DialogTitle className="sr-only">Sign up</DialogTitle>
				<div className="p-6">
					<AuthContainer variant="modal">
						<AuthHeader
							title="Ready to find your next role?"
							subtitle="Easy to use, fast enough to get results."
						/>
						<SignupForm onSuccess={handleSuccess} />
						<AuthDivider />
						<GoogleAuthButton mode="signup" onSuccess={handleSuccess} />
						<AuthStats />
						<AuthFooter />
					</AuthContainer>
				</div>
			</DialogContent>
		</Dialog>
	);
}
