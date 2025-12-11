"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const MessageHandler = () => {
	const searchParams = useSearchParams();

	const success = searchParams.get("success");
	const error = searchParams.get("error");
	const message = searchParams.get("message");

	useEffect(() => {
		if (success === "true") {
			toast.success(message);
		} else if (error === "true") {
			toast.error(message);
		}
	}, [success, error, message]);

	return null;
};
